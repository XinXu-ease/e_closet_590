import Link from "next/link";

export default function FigmaCloset() {
  return (
<div data-layer="AUTO / Closet" className="AutoCloset" style={{width: 402, height: 874, position: 'relative', background: 'var(--Color-Paper, #F7F2EC)', overflow: 'hidden', borderRadius: 32}}>
  <div data-layer="Frame 4" className="Frame4" style={{width: 402, paddingLeft: 24, paddingRight: 24, left: 0, top: 20, position: 'absolute', overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="Frame 3" className="Frame3" style={{flex: '1 1 0', paddingLeft: 4, paddingRight: 4, paddingTop: 5, paddingBottom: 5, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 5, display: 'inline-flex'}}>
      <div data-layer="Brand" className="Brand" style={{alignSelf: 'stretch', color: 'var(--Color-Muted, #756E63)', fontSize: 11, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>E-CLOSET</div>
      <div data-layer="Title" className="Title" style={{alignSelf: 'stretch', color: 'var(--Color-Ink, #29241F)', fontSize: 32, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>Closet</div>
      <div data-layer="Subtitle" className="Subtitle" style={{alignSelf: 'stretch', color: 'var(--Color-Muted, #756E63)', fontSize: 13, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Everything you own, ready to style.</div>
    </div>
    <Link href="/items/new" aria-label="Add item" data-layer="Add item" className="AddItem" style={{width: 48, height: 48, position: 'relative', background: 'var(--Color-Accent, #C7FF40)', overflow: 'hidden', borderRadius: 24}}>
      <div data-layer="Plus" className="Plus" style={{left: 15, top: 5, position: 'absolute', color: 'var(--Color-Ink, #29241F)', fontSize: 30, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>+</div>
    </Link>
  </div>
  <div data-layer="Search" className="Search" style={{width: 360, height: 42, paddingLeft: 16, paddingRight: 16, paddingTop: 11, paddingBottom: 11, left: 21, top: 118, position: 'absolute', background: 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', borderRadius: 16, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: 17, display: 'inline-flex'}}>
    <div data-layer="Icon" className="Icon" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 21, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>⌕</div>
    <div data-layer="Placeholder" className="Placeholder" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 14, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Search your closet</div>
  </div>
  <div data-layer="Frame 2" className="Frame2" style={{padding: 5, left: 24, top: 170, position: 'absolute', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 5, display: 'inline-flex'}}>
    <div data-layer="Filter / All" className="FilterAll" style={{paddingLeft: 14, paddingRight: 14, paddingTop: 9, paddingBottom: 9, background: 'var(--Color-Accent, #C7FF40)', overflow: 'hidden', borderRadius: 17, outline: '1px var(--Color-Accent, #C7FF40) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
      <div data-layer="Label" className="Label" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>All</div>
    </div>
    <div data-layer="Filter / Tops" className="FilterTops" style={{paddingLeft: 14, paddingRight: 14, paddingTop: 9, paddingBottom: 9, background: 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', borderRadius: 17, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
      <div data-layer="Label" className="Label" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 12, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Tops</div>
    </div>
    <div data-layer="Filter / Bottoms" className="FilterBottoms" style={{paddingLeft: 14, paddingRight: 14, paddingTop: 9, paddingBottom: 9, background: 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', borderRadius: 17, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
      <div data-layer="Label" className="Label" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 12, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Bottoms</div>
    </div>
    <div data-layer="Filter / Shoes" className="FilterShoes" style={{paddingLeft: 14, paddingRight: 14, paddingTop: 9, paddingBottom: 9, background: 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', borderRadius: 17, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
      <div data-layer="Label" className="Label" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 12, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Shoes</div>
    </div>
    <div data-layer="Filter / More" className="FilterMore" style={{paddingLeft: 14, paddingRight: 14, paddingTop: 9, paddingBottom: 9, background: 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', borderRadius: 17, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
      <div data-layer="Label" className="Label" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 12, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>More</div>
    </div>
  </div>
  <div data-layer="Frame 1" className="Frame1" style={{width: 363, left: 18, top: 224, position: 'absolute', overflow: 'hidden', justifyContent: 'center', alignItems: 'flex-start', gap: 20, display: 'inline-flex', flexWrap: 'wrap', alignContent: 'flex-start'}}>
    <Link href="/items/linen-shirt" aria-label="Open Linen shirt" data-layer="E-Closet / Item Card" data-tone="Sand" className="EClosetItemCard" style={{width: 171.50, alignSelf: 'stretch', padding: 8, background: 'var(--Color-Surface, #FFFEFB)', borderRadius: 14, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
      <div data-layer="Artwork" className="Artwork" style={{alignSelf: 'stretch', height: 126, background: 'var(--Color-Sand, #E8CFA8)', borderRadius: 11, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}} />
      <div data-layer="Linen shirt" className="LinenShirt" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 13, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Linen shirt</div>
      <div data-layer="Metadata / Category + Color Tag" className="MetadataCategoryColorTag" style={{alignSelf: 'stretch', overflow: 'hidden', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
        <div data-layer="Tops" className="Tops" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 10, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Tops</div>
        <div data-svg-wrapper data-layer="Color Tag / Sand" className="ColorTagSand">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6" cy="6" r="6" fill="var(--Color-Sand, #E8CFA8)"/>
          </svg>
        </div>
      </div>
    </Link>
    <Link href="/items/wide-trousers" aria-label="Open Wide trousers" data-layer="E-Closet / Item Card" data-tone="Blue" className="EClosetItemCard" style={{width: 171.50, alignSelf: 'stretch', padding: 8, background: 'var(--Color-Surface, #FFFEFB)', borderRadius: 14, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
      <div data-layer="Artwork" className="Artwork" style={{alignSelf: 'stretch', height: 126, background: 'var(--Color-Blue, #C7D9EB)', borderRadius: 11, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}} />
      <div data-layer="Wide trousers" className="WideTrousers" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 13, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Wide trousers</div>
      <div data-layer="Metadata / Category + Color Tag" className="MetadataCategoryColorTag" style={{alignSelf: 'stretch', overflow: 'hidden', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
        <div data-layer="Bottoms" className="Bottoms" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 10, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Bottoms</div>
        <div data-svg-wrapper data-layer="Color Tag / Blue" className="ColorTagBlue">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6" cy="6" r="6" fill="var(--Color-Blue, #C7D9EB)"/>
          </svg>
        </div>
      </div>
    </Link>
    <Link href="/items/daily-sneakers" aria-label="Open Daily sneakers" data-layer="E-Closet / Item Card" data-tone="Rose" className="EClosetItemCard" style={{width: 171.50, alignSelf: 'stretch', padding: 8, background: 'var(--Color-Surface, #FFFEFB)', borderRadius: 14, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
      <div data-layer="Artwork" className="Artwork" style={{alignSelf: 'stretch', height: 126, background: 'var(--Color-Rose, #EDC2B8)', borderRadius: 11, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}} />
      <div data-layer="Daily sneakers" className="DailySneakers" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 13, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Daily sneakers</div>
      <div data-layer="Metadata / Category + Color Tag" className="MetadataCategoryColorTag" style={{alignSelf: 'stretch', overflow: 'hidden', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
        <div data-layer="Shoes" className="Shoes" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 10, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Shoes</div>
        <div data-svg-wrapper data-layer="Color Tag / Rose" className="ColorTagRose">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6" cy="6" r="6" fill="var(--Color-Rose, #EDC2B8)"/>
          </svg>
        </div>
      </div>
    </Link>
    <Link href="/items/soft-tote" aria-label="Open Soft tote" data-layer="E-Closet / Item Card" data-tone="Sage" className="EClosetItemCard" style={{width: 171.50, alignSelf: 'stretch', padding: 8, background: 'var(--Color-Surface, #FFFEFB)', borderRadius: 14, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
      <div data-layer="Artwork" className="Artwork" style={{alignSelf: 'stretch', height: 126, background: 'var(--Color-Sage, #C7D6C2)', borderRadius: 11, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}} />
      <div data-layer="Soft tote" className="SoftTote" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 13, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Soft tote</div>
      <div data-layer="Metadata / Category + Color Tag" className="MetadataCategoryColorTag" style={{alignSelf: 'stretch', overflow: 'hidden', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
        <div data-layer="Accessories" className="Accessories" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 10, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Accessories</div>
        <div data-svg-wrapper data-layer="Color Tag / Sage" className="ColorTagSage">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6" cy="6" r="6" fill="var(--Color-Sage, #C7D6C2)"/>
          </svg>
        </div>
      </div>
    </Link>
  </div>
  <div data-layer="E-Closet / MVP Bottom Navigation" className="EClosetMvpBottomNavigation" style={{width: 370, height: 72, paddingLeft: 9, paddingRight: 9, paddingTop: 8, paddingBottom: 8, left: 16, top: 799, position: 'absolute', background: 'var(--Color-Surface, #FFFEFB)', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTop: '1px var(--Color-Line, #C2B8AB) solid', justifyContent: 'space-between', alignItems: 'flex-end', display: 'inline-flex'}}>
    <Link href="/closet" data-layer="Nav Item / Closet" className="NavItemCloset" style={{width: 112, height: 56, background: 'var(--Color-Accent, #C7FF40)', overflow: 'hidden', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
      <div data-svg-wrapper data-layer="Icon / Closet" className="IconCloset" style={{position: 'relative'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.25001 3.6665V18.3332M13.75 3.6665V18.3332M3.66667 3.6665H18.3333V18.3332H3.66667V3.6665Z" stroke="var(--Color-Ink, #29241F)" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div data-layer="Label / Closet" className="LabelCloset" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 11, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Closet</div>
    </Link>
    <Link href="/outfits/new" data-layer="Nav Item / Create" className="NavItemCreate" style={{width: 112, height: 56, overflow: 'hidden', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
      <div data-svg-wrapper data-layer="Icon / Create" className="IconCreate" style={{position: 'relative'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 4.5835V17.4168M4.58334 11.0002H17.4167" stroke="var(--Color-Muted, #756E63)" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div data-layer="Label / Create" className="LabelCreate" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Create</div>
    </Link>
    <Link href="/outfits" data-layer="Nav Item / Saved" className="NavItemSaved" style={{width: 112, height: 56, overflow: 'hidden', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
      <div data-svg-wrapper data-layer="Icon / Saved" className="IconSaved" style={{position: 'relative'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.41666 3.6665H15.5833V6.4165M7.33332 10.9998H14.6667M3.66666 6.4165H18.3333V18.3332H3.66666V6.4165Z" stroke="var(--Color-Muted, #756E63)" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div data-layer="Label / Saved" className="LabelSaved" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Saved</div>
    </Link>
  </div>
</div>
  );
}
