import { Helmet } from "react-helmet-async";

interface HeadProps {
  title: string;
  description?: string;
  jsonLd?: object;
  canonical?: string;
}

const SITE = "iceberg — production-readiness curriculum";

export function Head({ title, description, jsonLd, canonical }: HeadProps) {
  const fullTitle = title === SITE ? title : `${title} · ${SITE}`;
  const desc = description ?? "An interactive learning guide for the engineering skills that distinguish a deployed MVP from a real production system.";
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {canonical && <link rel="canonical" href={canonical} />}
      {jsonLd && (
        // Escape `<` to prevent the rare-but-classic JSON-in-script XSS
        // where a string in `jsonLd` could close the surrounding <script>.
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, "\\u003c")}
        </script>
      )}
    </Helmet>
  );
}
