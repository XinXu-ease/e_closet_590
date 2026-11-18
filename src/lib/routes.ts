const isMobileBuild = process.env.NEXT_PUBLIC_ECLOSET_TARGET === "mobile";

/** Keeps dynamic web routes out of the statically exported iOS bundle. */
export const routes = {
  item(id: string) {
    const value = encodeURIComponent(id);
    return isMobileBuild ? `/items/edit/?id=${value}` : `/items/${value}`;
  },
  outfit(id: string) {
    const value = encodeURIComponent(id);
    return isMobileBuild ? `/outfits/edit/?id=${value}` : `/outfits/${value}`;
  },
};
