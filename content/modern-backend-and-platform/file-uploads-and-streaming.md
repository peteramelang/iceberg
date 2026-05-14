---
slug: file-uploads-and-streaming
title: File Uploads and Streaming
phase: modern-backend-and-platform
order: 8
summary: >-
  Multipart uploads, signed URLs, resumable uploads, virus scanning, and
  on-the-fly image transforms.
tldr: >-
  Generate signed URLs and let browsers upload directly to object storage.
  Avoids bottlenecks and memory pressure on your application server.
definition: >-
  File uploads involve moving binary data—images, videos, documents,
  archives—from a client to durable storage. The naive approach of routing files
  through your application server creates bottlenecks, memory pressure, and a
  single point of failure. The production pattern is to generate a short-lived
  signed URL server-side and have the client upload directly to object storage
  (AWS S3, Cloudflare R2, GCP GCS). For files larger than a few hundred MB,
  multipart upload breaks the payload into parallel chunks, each with its own
  signed URL, enabling resumable transfers and dramatically better throughput.


  Resumable uploads go further: the tus protocol is an open HTTP-based standard
  (now being standardized by the IETF) that lets clients resume an interrupted
  upload from any byte offset. Libraries like Uppy implement the client side,
  while cloud providers including Cloudflare Stream, Supabase, and Vimeo support
  tus server-side. On-the-fly image transforms—resizing, format conversion, CDN
  delivery—are handled by services like Cloudinary and Imgix, removing the need
  to store pre-resized variants.


  Virus scanning and content moderation sit between upload and storage
  finalization: common patterns use an S3 lifecycle rule or a post-upload
  webhook to trigger a scanner (ClamAV self-hosted, or Cloudmersive, VirusTotal
  APIs) before marking the file as accessible. Video pipelines add
  transcoding—Mux and Cloudinary both offer upload-to-adaptive-streaming
  workflows that accept a raw upload and produce HLS manifests automatically.
shortExplainerVideo: null
narrative: >-
  Routing file uploads through your application server is one of those decisions
  that feels fine until your app gains real users. A 50MB PDF upload ties up a
  Node.js worker thread for seconds; a hundred concurrent uploads exhaust your
  connection pool; a user on a flaky mobile connection retries from byte zero
  and burns their data plan while your server re-receives the entire payload.
  The production architecture is well-established: generate a short-lived signed
  URL server-side, hand it to the client, and have the client upload directly to
  object storage. Your application server is completely out of the hot path of
  the transfer itself. The client gets a direct connection to S3 or R2's global
  infrastructure, your server stays responsive, and your egress costs drop to
  nearly zero on uploads.


  The 80/20 for most applications is direct-to-storage uploads with signed PUT
  URLs for files under 100MB, multipart uploads for anything larger, and an
  S3-compatible object store (S3, R2, or GCS) as the storage layer. The
  multipart upload API is more involved — you initiate the upload to get an
  upload ID, presign each part URL, upload the parts in parallel from the
  client, then complete the upload with a list of ETags — but virtually every
  major object storage SDK handles this pattern, and libraries like Uppy
  abstract it entirely for the browser. The operational win is that you can
  resume after a dropped connection from any chunk boundary rather than
  restarting from byte zero.


  The failure modes in file upload systems cluster in a few specific spots. The
  most common is the upload-to-processing gap: the file lands in storage, but
  the record in your database that tracks file state never updates to "ready"
  because the webhook or callback that triggers processing was dropped or the
  processing job failed silently. Users see a loading spinner forever or a
  generic error. The fix is to treat the file's state machine explicitly —
  pending, uploaded, processing, ready, failed — and make every transition
  durable and observable. The second failure mode is skipping content
  verification: a malicious client can PUT a valid presigned URL but change the
  Content-Type header, upload malware disguised as an image, or upload files far
  exceeding your intended size limit. Validate file type server-side using magic
  bytes after upload, not the MIME type the client reports, and set
  Content-Length-Range conditions in your presign policy.


  Virus scanning sits awkwardly in this picture because it inherently adds
  latency between upload and availability. The practical pattern is to land the
  file in a "quarantine" prefix in object storage, trigger an async scan via a
  job queue, and only move the file to the public prefix on a clean result. For
  applications where user-generated files are visible to other users — a
  document sharing app, a community platform — skipping this step is a security
  decision, not a performance optimization. ClamAV is free and integrable but
  requires infrastructure; commercial APIs like Cloudmersive or the VirusTotal
  API are lower-friction for early-stage products.


  The broader ecosystem reflects the complexity of the problem. Cloudinary and
  Imgix are not just storage — they are on-the-fly image transform pipelines
  that eliminate the need to store pre-resized variants at all; you store the
  original and let the CDN handle every crop, format, and quality variant on
  demand. Mux and Cloudflare Stream do the equivalent for video: accept a raw
  upload, transcode to adaptive bitrate HLS, and serve via a globally
  distributed player infrastructure. Reaching for these services is not
  laziness; transcoding and adaptive streaming are genuinely hard problems, and
  the cost of building and operating them in-house for a small team is orders of
  magnitude higher than the service fees.
pitfalls:
  - title: Routing uploads through the application server
    explanation: >-
      When file bytes flow through your app server before reaching storage,
      large uploads consume server memory, block request handlers, and create a
      single failure point. Generate a signed URL server-side and have clients
      upload directly to object storage.
  - title: No size or type validation before accepting uploads
    explanation: >-
      Accepting files without validating MIME type and size on the server — not
      just client-side — allows oversized payloads and unexpected file types to
      reach storage and downstream processors. Enforce hard server-side limits
      and allowlisted content types.
  - title: Files accessible before virus scan completes
    explanation: >-
      Making an uploaded file immediately accessible creates a window where
      malicious files can be downloaded by other users or executed by downstream
      processors. Gate file visibility on a completed scan result before
      updating its status to accessible.
  - title: No resumable upload for large files
    explanation: >-
      A 500 MB video upload that fails at 95% completion forces the user to
      restart from zero, which in practice means they give up. The tus protocol
      and multipart S3 uploads both provide byte-range resumption — use them for
      anything over a few hundred MB.
  - title: Storing original filename from user input as filesystem path
    explanation: >-
      Using the user-supplied filename as the storage key allows path traversal
      and key collisions. Generate a UUID-based storage key server-side and
      store the original filename as metadata separate from the storage path.
codeExamples:
  - language: typescript
    title: Multipart S3 Upload with Progress Tracking
    code: |-
      import { S3Client, CreateMultipartUploadCommand,
               UploadPartCommand, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";

      const s3 = new S3Client({ region: process.env.AWS_REGION! });
      const BUCKET = process.env.UPLOAD_BUCKET!;
      const PART_SIZE = 10 * 1024 * 1024; // 10 MB per part

      export async function multipartUpload(
        key: string,
        buffer: Buffer,
        onProgress?: (pct: number) => void
      ): Promise<string> {
        const { UploadId } = await s3.send(new CreateMultipartUploadCommand({ Bucket: BUCKET, Key: key }));

        const parts: { ETag: string; PartNumber: number }[] = [];
        const totalParts = Math.ceil(buffer.length / PART_SIZE);

        for (let i = 0; i < totalParts; i++) {
          const start = i * PART_SIZE;
          const chunk = buffer.subarray(start, start + PART_SIZE);

          const { ETag } = await s3.send(new UploadPartCommand({
            Bucket: BUCKET,
            Key: key,
            UploadId,
            PartNumber: i + 1,
            Body: chunk
          }));

          parts.push({ ETag: ETag!, PartNumber: i + 1 });
          onProgress?.(Math.round(((i + 1) / totalParts) * 100));
        }

        await s3.send(new CompleteMultipartUploadCommand({
          Bucket: BUCKET, Key: key, UploadId,
          MultipartUpload: { Parts: parts }
        }));

        return `s3://${BUCKET}/${key}`;
      }
    reasoning: >-
      A complete multipart S3 upload implementation with progress callback —
      showing the three-phase protocol (create, upload parts, complete) that
      handles large files and enables resumable transfers.
difficulty: intermediate
estimatedHours: 6
lastUpdatedAt: '2026-05-14T12:31:47.573Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=HkF3_GLVKEg'
      title: 'Beyond 5GB: How to Tackle Large File Uploads with AWS S3'
      author: Laith Academy
      durationMinutes: 14
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Focused walkthrough of S3 multipart upload with presigned URLs, covering
        chunking, parallel upload, and completion—exactly the production pattern
        teams need.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=83bECYmPbI4'
      title: >-
        The Ultimate Guide to File Uploads in Next.js (S3, Presigned URLs,
        Dropzone)
      author: Josh tried coding
      durationMinutes: 55
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        End-to-end implementation guide covering client-side file selection,
        server-side presigned URL generation, direct S3 upload, and progress
        tracking in a Next.js app.
      source: ai-researcher
  articles:
    - url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html'
      title: Uploading and copying objects using multipart upload — Amazon S3
      kind: canonical-doc
      reasoning: >-
        The authoritative reference for S3 multipart upload: part size
        requirements, lifecycle rules, and the complete API flow.
      publisher: AWS
      source: ai-researcher
    - url: 'https://tus.io/protocols/resumable-upload'
      title: Resumable upload protocol 1.0.x — tus
      kind: canonical-doc
      reasoning: >-
        The tus resumable upload open protocol specification—the standard all
        production-grade resumable upload implementations should be evaluated
        against.
      publisher: tus.io
      source: ai-researcher
    - url: 'https://uppy.io/docs/tus/'
      title: Tus — Uppy
      kind: canonical-doc
      reasoning: >-
        Official Uppy docs for the tus plugin, showing how to wire a
        production-ready client-side resumable upload from file selection
        through completion.
      publisher: Transloadit
      source: ai-researcher
  services:
    - name: AWS S3
      url: 'https://aws.amazon.com/s3/'
      category: object storage
      reasoning: >-
        The de-facto standard for durable object storage; multipart upload,
        presigned URLs, lifecycle rules, and the widest ecosystem support.
      vendor: Amazon Web Services
      source: ai-researcher
    - name: Cloudflare R2
      url: 'https://www.cloudflare.com/developer-platform/r2/'
      category: object storage
      reasoning: >-
        S3-compatible object storage with zero egress fees—a cost-effective
        alternative for serving files via CDN without bandwidth charges.
      vendor: Cloudflare
      source: ai-researcher
    - name: Cloudinary
      url: 'https://cloudinary.com/'
      category: 'media upload, transform, and delivery'
      reasoning: >-
        Managed platform for image and video upload, on-the-fly transformation
        (resize, crop, format), and CDN delivery—removes all media pipeline
        infrastructure.
      vendor: Cloudinary
      source: ai-researcher
    - name: Mux
      url: 'https://www.mux.com/'
      category: video upload and streaming
      reasoning: >-
        Developer-first video API that accepts raw uploads and produces adaptive
        HLS streams, player embeds, and real-time analytics without building a
        transcoding pipeline.
      vendor: Mux Inc.
      source: ai-researcher
    - name: UploadThing
      url: 'https://uploadthing.com/'
      category: file upload service
      reasoning: >-
        TypeScript-first file upload service built for Next.js and full-stack TS
        apps; wraps S3 with type-safe upload routes, access control, and
        callbacks.
      vendor: Ping Labs
      source: ai-researcher
  courses: []
provenance:
  researchedAt: '2026-05-14T12:26:04.523Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
