export type NavItem = {
  href: string;
  label: string;
};

export const siteConfig = {
  title: "NHL Trade Simulator",
  description:
    "A Vegas-first NHL trade simulator with live public roster data, contract-aware trade logic, draft-pick assets, post-trade lineup building, and model-driven outcome analysis.",
  navigation: [
    { href: "/", label: "Home" },
    { href: "#simulator", label: "Simulator" },
    { href: "#method", label: "About" }
  ] satisfies NavItem[]
};
