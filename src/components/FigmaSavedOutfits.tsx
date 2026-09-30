import Link from "next/link";

export default function FigmaSavedOutfits() {
  return (
<div data-layer="AUTO / Saved Outfits" className="AutoSavedOutfits" style={{width: 402, height: 874, position: 'relative', background: 'var(--Color-Paper, #F7F2EC)', overflow: 'hidden', borderRadius: 32}}>
  <div data-layer="E-Closet / MVP Bottom Navigation" className="EClosetMvpBottomNavigation" style={{width: 370, height: 72, paddingLeft: 9, paddingRight: 9, paddingTop: 8, paddingBottom: 8, left: 16, top: 802, position: 'absolute', background: 'var(--Color-Surface, #FFFEFB)', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTop: '1px var(--Color-Line, #C2B8AB) solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
    <Link href="/closet" data-layer="Nav Item / Closet" className="NavItemCloset" style={{width: 112, height: 56, overflow: 'hidden', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
      <div data-svg-wrapper data-layer="Icon / Closet" className="IconCloset" style={{position: 'relative'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.25008 3.6665V18.3332M13.7501 3.6665V18.3332M3.66675 3.6665H18.3334V18.3332H3.66675V3.6665Z" stroke="var(--Color-Muted, #756E63)" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div data-layer="Label / Closet" className="LabelCloset" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Closet</div>
    </Link>
    <Link href="/outfits/new" data-layer="Nav Item / Create" className="NavItemCreate" style={{width: 112, height: 56, overflow: 'hidden', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
      <div data-svg-wrapper data-layer="Icon / Create" className="IconCreate" style={{position: 'relative'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.9999 4.5835V17.4168M4.58325 11.0002H17.4166" stroke="var(--Color-Muted, #756E63)" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div data-layer="Label / Create" className="LabelCreate" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Create</div>
    </Link>
    <Link href="/outfits" data-layer="Nav Item / Saved" className="NavItemSaved" style={{width: 112, height: 56, background: 'var(--Color-Accent, #C7FF40)', overflow: 'hidden', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
      <div data-svg-wrapper data-layer="Icon / Saved" className="IconSaved" style={{position: 'relative'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.41675 3.6665H15.5834V6.4165M7.33341 10.9998H14.6667M3.66675 6.4165H18.3334V18.3332H3.66675V6.4165Z" stroke="var(--Color-Ink, #29241F)" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div data-layer="Label / Saved" className="LabelSaved" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 11, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Saved</div>
    </Link>
  </div>
  <div data-layer="Frame 12" className="Frame12" style={{width: 401, paddingLeft: 24, paddingRight: 24, left: 0, top: 124, position: 'absolute', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'inline-flex', flexWrap: 'wrap', alignContent: 'flex-start'}}>
    <Link href="/outfits/sunday-market" data-layer="Saved outfit / Sunday market" className="SavedOutfitSundayMarket" style={{width: 170.50, padding: 12, background: 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', borderRadius: 14, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
      <div data-layer="Name" className="Name" style={{alignSelf: 'stretch', height: 21, textAlign: 'center', color: 'var(--Color-Ink, #29241F)', fontSize: 14, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>Sunday market</div>
      <div data-layer="Preview" className="Preview" style={{alignSelf: 'stretch', height: 197, paddingTop: 40, paddingBottom: 7, paddingLeft: 7, paddingRight: 7, background: 'var(--Color-Blue, #C7D9EB)', borderRadius: 18, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 10, display: 'flex'}}>
        <div data-layer="Route badge" className="RouteBadge" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 8, paddingBottom: 8, background: 'var(--Color-Accent, #C7FF40)', overflow: 'hidden', borderRadius: 17, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Label" className="Label" style={{textAlign: 'center', color: 'var(--Color-Ink, #29241F)', fontSize: 11, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Open →</div>
        </div>
      </div>
    </Link>
    <Link href="/outfits/name-2" data-layer="Saved outfit / Sunday market" className="SavedOutfitSundayMarket" style={{width: 170.50, padding: 12, background: 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', borderRadius: 14, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
      <div data-layer="Name" className="Name" style={{alignSelf: 'stretch', height: 21, textAlign: 'center', color: 'var(--Color-Ink, #29241F)', fontSize: 14, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>Name2</div>
      <div data-layer="Preview" className="Preview" style={{alignSelf: 'stretch', height: 197, paddingTop: 40, paddingBottom: 7, paddingLeft: 7, paddingRight: 7, background: 'var(--Color-Blue, #C7D9EB)', borderRadius: 18, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 10, display: 'flex'}}>
        <div data-layer="Route badge" className="RouteBadge" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 8, paddingBottom: 8, background: 'var(--Color-Accent, #C7FF40)', overflow: 'hidden', borderRadius: 17, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Label" className="Label" style={{textAlign: 'center', color: 'var(--Color-Ink, #29241F)', fontSize: 11, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Open →</div>
        </div>
      </div>
    </Link>
    <Link href="/outfits/name-3" data-layer="Saved outfit / Sunday market" className="SavedOutfitSundayMarket" style={{width: 170.50, padding: 12, background: 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', borderRadius: 14, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
      <div data-layer="Name" className="Name" style={{alignSelf: 'stretch', height: 21, textAlign: 'center', color: 'var(--Color-Ink, #29241F)', fontSize: 14, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>Name3</div>
      <div data-layer="Preview" className="Preview" style={{alignSelf: 'stretch', height: 197, paddingTop: 40, paddingBottom: 7, paddingLeft: 7, paddingRight: 7, background: 'var(--Color-Blue, #C7D9EB)', borderRadius: 18, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 10, display: 'flex'}}>
        <div data-layer="Route badge" className="RouteBadge" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 8, paddingBottom: 8, background: 'var(--Color-Accent, #C7FF40)', overflow: 'hidden', borderRadius: 17, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Label" className="Label" style={{textAlign: 'center', color: 'var(--Color-Ink, #29241F)', fontSize: 11, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Open →</div>
        </div>
      </div>
    </Link>
    <Link href="/outfits/name-4" data-layer="Saved outfit / Sunday market" className="SavedOutfitSundayMarket" style={{width: 170.50, padding: 12, background: 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', borderRadius: 14, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
      <div data-layer="Name" className="Name" style={{alignSelf: 'stretch', height: 21, textAlign: 'center', color: 'var(--Color-Ink, #29241F)', fontSize: 14, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>Name4</div>
      <div data-layer="Preview" className="Preview" style={{alignSelf: 'stretch', height: 197, paddingTop: 40, paddingBottom: 7, paddingLeft: 7, paddingRight: 7, background: 'var(--Color-Blue, #C7D9EB)', borderRadius: 18, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 10, display: 'flex'}}>
        <div data-layer="Route badge" className="RouteBadge" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 8, paddingBottom: 8, background: 'var(--Color-Accent, #C7FF40)', overflow: 'hidden', borderRadius: 17, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div data-layer="Label" className="Label" style={{textAlign: 'center', color: 'var(--Color-Ink, #29241F)', fontSize: 11, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Open →</div>
        </div>
      </div>
    </Link>
  </div>
  <div data-layer="Frame 4" className="Frame4" style={{width: 402, paddingLeft: 24, paddingRight: 24, left: 0, top: 23, position: 'absolute', overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="Frame 3" className="Frame3" style={{flex: '1 1 0', paddingLeft: 4, paddingRight: 4, paddingTop: 5, paddingBottom: 5, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 5, display: 'inline-flex'}}>
      <div data-layer="Brand" className="Brand" style={{alignSelf: 'stretch', color: 'var(--Color-Muted, #756E63)', fontSize: 11, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>E-CLOSET</div>
      <div data-layer="Title" className="Title" style={{alignSelf: 'stretch', color: 'var(--Color-Ink, #29241F)', fontSize: 30, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>Saved Outfits</div>
      <div data-layer="Subtitle" className="Subtitle" style={{alignSelf: 'stretch', color: 'var(--Color-Muted, #756E63)', fontSize: 13, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Tap a card to reopen it in Outfit Builder.</div>
    </div>
    <Link href="/outfits/new" aria-label="Create outfit" data-layer="Add outfit" className="AddOutfit" style={{width: 48, height: 48, position: 'relative', background: 'var(--Color-Accent, #C7FF40)', overflow: 'hidden', borderRadius: 24}}>
      <div data-layer="Plus" className="Plus" style={{left: 15, top: 5, position: 'absolute', color: 'var(--Color-Ink, #29241F)', fontSize: 30, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>+</div>
    </Link>
  </div>
</div>
  );
}
