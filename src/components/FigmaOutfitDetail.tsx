"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type FigmaOutfitDetailProps = {
  mode: "create" | "edit";
};

export default function FigmaOutfitDetail({ mode }: FigmaOutfitDetailProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  return (
<div data-layer="AUTO / Outfit Detail" className="AutoOutfitDetail" style={{width: 402, height: 874, position: 'relative', background: 'var(--Color-Paper, #F7F2EC)', overflow: 'hidden', borderRadius: 32}}>
  <div data-layer="E-Closet / MVP Bottom Navigation" className="EClosetMvpBottomNavigation" style={{width: 370, height: 72, paddingLeft: 9, paddingRight: 9, paddingTop: 8, paddingBottom: 8, left: 16, top: 802, position: 'absolute', background: 'var(--Color-Surface, #FFFEFB)', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTop: '1px var(--Color-Line, #C2B8AB) solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
    <Link href="/closet" data-layer="Nav Item / Closet" className="NavItemCloset" style={{width: 112, height: 56, overflow: 'hidden', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
      <div data-svg-wrapper data-layer="Icon / Closet" className="IconCloset" style={{position: 'relative'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.25008 3.6665V18.3332M13.7501 3.6665V18.3332M3.66675 3.6665H18.3334V18.3332H3.66675V3.6665Z" stroke="var(--Color-Muted, #756E63)" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div data-layer="Label / Closet" className="LabelCloset" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Closet</div>
    </Link>
    <Link href="/outfits/new" data-layer="Nav Item / Create" className="NavItemCreate" style={{width: 112, height: 56, background: 'var(--Color-Accent, #C7FF40)', overflow: 'hidden', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
      <div data-svg-wrapper data-layer="Icon / Create" className="IconCreate" style={{position: 'relative'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.9999 4.5835V17.4168M4.58325 11.0002H17.4166" stroke="var(--Color-Ink, #29241F)" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div data-layer="Label / Create" className="LabelCreate" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 11, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Create</div>
    </Link>
    <Link href="/outfits" data-layer="Nav Item / Saved" className="NavItemSaved" style={{width: 112, height: 56, overflow: 'hidden', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
      <div data-svg-wrapper data-layer="Icon / Saved" className="IconSaved" style={{position: 'relative'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.41675 3.6665H15.5834V6.4165M7.33341 10.9998H14.6667M3.66675 6.4165H18.3334V18.3332H3.66675V6.4165Z" stroke="var(--Color-Muted, #756E63)" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div data-layer="Label / Saved" className="LabelSaved" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Saved</div>
    </Link>
  </div>
  <div data-layer="Frame 5" className="Frame5" style={{width: 402, paddingLeft: 24, paddingRight: 24, left: 0, top: 20, position: 'absolute', overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'flex-start', display: 'inline-flex'}}>
    <button type="button" aria-label={isEdit ? "Back to Saved Outfits" : "Back to Closet"} data-layer="Back" className="Back" onClick={() => router.push(isEdit ? '/outfits' : '/closet')} style={{padding: 0, border: 0, background: 'transparent', color: 'var(--Color-Ink, #29241F)', fontSize: 26, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>←</button>
    <div data-layer="Frame 3" className="Frame3" style={{flex: '1 1 0', paddingLeft: 4, paddingRight: 4, paddingTop: 5, paddingBottom: 5, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 5, display: 'inline-flex'}}>
      <div data-layer="Title" className="Title" style={{alignSelf: 'stretch', color: 'var(--Color-Ink, #29241F)', fontSize: 20, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>Outfit Detail</div>
      <div data-layer="Subtitle" className="Subtitle" style={{alignSelf: 'stretch', color: 'var(--Color-Muted, #756E63)', fontSize: 13, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Drag, layer, and resize your pieces.</div>
    </div>
  </div>
  <div data-layer="Frame 13" className="Frame13" style={{left: 24, top: 91, position: 'absolute', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
    <div data-layer="Outfit canvas" className="OutfitCanvas" style={{alignSelf: 'stretch', height: 330, position: 'relative', background: 'var(--Color-Surface, #FFFEFB)', borderRadius: 24, border: '1px var(--Color-Line, #C2B8AB) solid'}} />
    <div data-layer="Outfit Copy" className="OutfitCopy" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 6, display: 'flex'}}>
      <div data-layer="Slow Sunday" className="SlowSunday" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 28, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>Slow Sunday</div>
    </div>
    <div data-layer="Layer controls" className="LayerControls" style={{alignSelf: 'stretch', height: 41, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, overflow: 'hidden', borderRadius: 14, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
      <div data-layer="Control" className="Control" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>↥ Front</div>
      <div data-layer="Control" className="Control" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>↧ Back</div>
      <div data-layer="Control" className="Control" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>⧉ Duplicate</div>
      <div data-layer="Control" className="Control" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>× Remove</div>
    </div>
    <div data-layer="Frame 2" className="Frame2" style={{alignSelf: 'stretch', height: 109, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
      <div data-layer="Section label" className="SectionLabel" style={{alignSelf: 'stretch', color: 'var(--Color-Muted, #756E63)', fontSize: 11, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>ADD FROM CLOSET</div>
      <div data-layer="Item tray" className="ItemTray" style={{alignSelf: 'stretch', overflow: 'hidden', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Tray / Top" className="TrayTop" style={{width: 78, height: 78, paddingLeft: 10, paddingRight: 10, paddingTop: 14, paddingBottom: 14, background: 'var(--Color-Sand, #E8CFA8)', overflow: 'hidden', borderRadius: 14, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Glyph" className="Glyph" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 28, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>▥</div>
          <div data-layer="Label" className="Label" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Top</div>
        </div>
        <div data-layer="Tray / Bottom" className="TrayBottom" style={{width: 78, height: 78, paddingLeft: 10, paddingRight: 10, paddingTop: 14, paddingBottom: 14, background: 'var(--Color-Blue, #C7D9EB)', overflow: 'hidden', borderRadius: 14, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Glyph" className="Glyph" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 28, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>▤</div>
          <div data-layer="Label" className="Label" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Bottom</div>
        </div>
        <div data-layer="Tray / Shoes" className="TrayShoes" style={{width: 78, height: 78, paddingLeft: 10, paddingRight: 10, paddingTop: 14, paddingBottom: 14, background: 'var(--Color-Rose, #EDC2B8)', overflow: 'hidden', borderRadius: 14, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Glyph" className="Glyph" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 28, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>⌁</div>
          <div data-layer="Label" className="Label" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Shoes</div>
        </div>
        <div data-layer="Tray / Bag" className="TrayBag" style={{width: 78, height: 78, paddingLeft: 10, paddingRight: 10, paddingTop: 14, paddingBottom: 14, background: 'var(--Color-Sage, #C7D6C2)', overflow: 'hidden', borderRadius: 14, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Glyph" className="Glyph" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 28, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>▢</div>
          <div data-layer="Label" className="Label" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Accessories</div>
        </div>
      </div>
    </div>
    <div data-layer="Frame 16" className="Frame16" style={{justifyContent: 'flex-start', alignItems: 'center', gap: isEdit ? 16 : 13, display: 'inline-flex'}}>
      <button type="button" data-layer={isEdit ? "Action / Delete" : "Action / Cancel"} className={isEdit ? "ActionDelete" : "ActionCancel"} onClick={() => router.push('/outfits')} style={{width: isEdit ? 169 : undefined, paddingLeft: isEdit ? undefined : 61, paddingRight: isEdit ? undefined : 61, paddingTop: 17, paddingBottom: 17, background: isEdit ? 'var(--Color-Danger, #C74038)' : 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', border: 0, borderRadius: 16, outline: isEdit ? '1px var(--Color-Danger, #C74038) solid' : '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
        <div data-layer="Label" className="Label" style={{color: isEdit ? 'var(--Color-Surface, #FFFEFB)' : 'var(--Color-Ink, #29241F)', fontSize: 14, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>{isEdit ? "Delete" : "Cancel"}</div>
      </button>
      <button type="button" data-layer="Action / Save" className="ActionSave" onClick={() => router.push('/outfits')} style={{width: isEdit ? 169 : undefined, paddingLeft: isEdit ? undefined : 68, paddingRight: isEdit ? undefined : 68, paddingTop: 17, paddingBottom: 17, background: 'var(--Color-Accent, #C7FF40)', overflow: 'hidden', border: 0, borderRadius: 16, outline: '1px var(--Color-Accent, #C7FF40) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
        <div data-layer="Label" className="Label" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 14, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Save</div>
      </button>
    </div>
  </div>
</div>
  );
}
