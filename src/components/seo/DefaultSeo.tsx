import { matchPath, useLocation } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const DefaultSeo = () => {
  const location = useLocation();
  const { pathname } = location;

  const isEquipmentDetail = Boolean(matchPath("/equipment/:id", pathname));
  const isRentalOperations = Boolean(matchPath("/rental/:id", pathname));

  if (pathname === "/") {
    return (
      <Seo
        title="Construction Equipment Rentals Marketplace"
        description="Find trusted construction equipment rentals with transparent pricing, verified businesses, and streamlined rental workflows on Upyog."
        canonicalPath="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/browse?query={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          },
        ]}
      />
    );
  }

  if (pathname === "/browse") {
    return (
      <Seo
        title="Browse Construction Equipment Rentals"
        description="Compare verified construction equipment rentals by category, pricing, and location to book the right machinery for your next project."
        canonicalPath="/browse"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Browse Construction Equipment Rentals",
          description:
            "Compare verified construction equipment rentals by category, pricing, and location.",
          url: `${SITE_URL}/browse`,
          isPartOf: {
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
          },
        }}
      />
    );
  }

  if (isEquipmentDetail) {
    return (
      <Seo
        title="Construction Equipment Rental Details"
        description="View rental pricing, availability, and owner trust signals for this construction equipment listing on Upyog."
      />
    );
  }

  if (pathname === "/materials/list") {
    return (
      <Seo
        title="Construction Materials Listings"
        description="Explore construction material listings, compare details, and connect with suppliers through Upyog."
        canonicalPath="/materials/list"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Construction Materials Listings",
          url: `${SITE_URL}/materials/list`,
          isPartOf: {
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
          },
        }}
      />
    );
  }

  if (pathname === "/materials/find") {
    return (
      <Seo
        title="Find Construction Materials"
        description="Search construction material availability and supplier options for your project requirements."
        canonicalPath="/materials/find"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          name: "Find Construction Materials",
          url: `${SITE_URL}/materials/find`,
          isPartOf: {
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
          },
        }}
      />
    );
  }

  if (pathname === "/auth") {
    return (
      <Seo
        title="Sign In"
        description="Sign in to manage equipment listings, rental requests, and operations on Upyog."
        canonicalPath="/auth"
        robots="noindex,follow"
      />
    );
  }

  if (
    pathname === "/dashboard" ||
    pathname === "/dashboard/add-equipment" ||
    pathname === "/finance" ||
    pathname === "/analytics" ||
    pathname === "/chat" ||
    pathname === "/materials/verify" ||
    isRentalOperations
  ) {
    return (
      <Seo
        title="User Workspace"
        description="Manage rentals, operations, and business activities on Upyog."
        robots="noindex,follow"
      />
    );
  }

  return (
    <Seo
      title="Page Not Found"
      description="The page you are looking for is not available on Upyog."
      robots="noindex,follow"
      canonicalPath="/404"
    />
  );
};

export default DefaultSeo;