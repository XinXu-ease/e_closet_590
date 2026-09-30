"use client";

import { useRouter } from "next/navigation";

type FigmaItemDetailProps = {
  mode: "add" | "edit";
};

export default function FigmaItemDetail({ mode }: FigmaItemDetailProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  return (
<div data-layer={isEdit ? "AUTO / Item Detail — Edit" : "AUTO / Item Detail — Add"} className={isEdit ? "AutoItemDetailEdit" : "AutoItemDetailAdd"} style={{width: 402, height: 874, position: 'relative', background: 'var(--Color-Paper, #F7F2EC)', overflow: 'hidden', borderRadius: 32}}>
  {isEdit ? (
    <div data-layer="Image / Existing item" className="ImageExistingItem" style={{width: 354, height: 300, left: 24, top: 92, position: 'absolute', background: 'var(--Color-Sand, #E8CFA8)', borderRadius: 24}} />
  ) : (
  <div data-layer="Image picker / Empty" className="ImagePickerEmpty" style={{width: 354, height: 300, left: 24, top: 92, position: 'absolute', background: 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', borderRadius: 24, outline: '2px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-2px'}}>
    <div data-svg-wrapper data-layer="Upload icon" className="UploadIcon" style={{left: 145, top: 76, position: 'absolute'}}>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="32" fill="var(--Color-Accent, #C7FF40)"/>
      <path d="M30.5909 41.75V23H33.7727V41.75H30.5909ZM22.8068 33.9659V30.7841H41.5568V33.9659H22.8068Z" fill="var(--Color-Ink, #29241F)"/>
      </svg>
    </div>
    <div data-layer="Prompt" className="Prompt" style={{left: 93, top: 158, position: 'absolute', color: 'var(--Color-Ink, #29241F)', fontSize: 15, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Tap to choose a photo</div>
    <div data-layer="Helper" className="Helper" style={{left: 65, top: 187, position: 'absolute', color: 'var(--Color-Muted, #756E63)', fontSize: 12, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Background removal runs automatically</div>
  </div>
  )}
  <div data-layer="Frame 6" className="Frame6" style={{width: 354, left: 24, top: 422, position: 'absolute', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'inline-flex'}}>
    <div data-layer="Frame 7" className="Frame7" style={{alignSelf: 'stretch', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
      <div data-layer="Label / Name" className="LabelName" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Name</div>
      <div data-layer="Field / Name" className="FieldName" style={{alignSelf: 'stretch', height: 42, position: 'relative', background: 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', borderRadius: 14, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px'}}>
        <div data-layer="Value" className="Value" style={{left: 16, top: 13, position: 'absolute', color: isEdit ? 'var(--Color-Ink, #29241F)' : 'var(--Color-Muted, #756E63)', fontSize: 14, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>{isEdit ? "Linen shirt" : "Item name"}</div>
      </div>
    </div>
    <div data-layer="Frame 8" className="Frame8" style={{alignSelf: 'stretch', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
      <div data-layer="Label / Category" className="LabelCategory" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Category</div>
      <div data-layer="Field / Category" className="FieldCategory" style={{alignSelf: 'stretch', height: 42, position: 'relative', background: 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', borderRadius: 14, outline: '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px'}}>
        <div data-layer="Value" className="Value" style={{left: 16, top: 13, position: 'absolute'}}><span style={{color: isEdit ? 'var(--Color-Ink, #29241F)' : 'var(--Color-Muted, #756E63)', fontSize: 14, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>{isEdit ? "Tops   " : "Choose a category   "}</span><span style={{color: isEdit ? 'var(--Color-Ink, #29241F)' : 'var(--Color-Muted, #756E63)', fontSize: 14, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>▾</span></div>
      </div>
    </div>
    <div data-layer="Frame 9" className="Frame9" style={{alignSelf: 'stretch', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
      <div data-layer="Label / Category" className="LabelCategory" style={{color: 'var(--Color-Muted, #756E63)', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Tag</div>
      <div data-layer="Frame 10" className="Frame10" style={{alignSelf: 'stretch', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
        <div data-svg-wrapper data-layer="Ellipse 6" className="Ellipse6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#DD6C66"/>
          </svg>
        </div>
        <div data-svg-wrapper data-layer="Ellipse 1" className="Ellipse1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="11.5" fill="#EDC2B8" stroke="#D1CCC2"/>
          </svg>
        </div>
        <div data-svg-wrapper data-layer="Ellipse 3" className="Ellipse3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#E8CFA8"/>
          </svg>
        </div>
        <div data-svg-wrapper data-layer="Ellipse 7" className="Ellipse7">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#EBF521"/>
          </svg>
        </div>
        <div data-svg-wrapper data-layer="Ellipse 4" className="Ellipse4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#AAD9AC"/>
          </svg>
        </div>
        <div data-svg-wrapper data-layer="Ellipse 2" className="Ellipse2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#A9C6F2"/>
          </svg>
        </div>
        <div data-svg-wrapper data-layer="Ellipse 5" className="Ellipse5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#A99BE8"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
  <div data-layer="Frame 16" className="Frame16" style={{left: 24, top: 790, position: 'absolute', justifyContent: 'flex-start', alignItems: 'center', gap: 13, display: 'inline-flex'}}>
    <button type="button" data-layer={isEdit ? "Action / Delete" : "Action / Cancel"} className={isEdit ? "ActionDelete" : "ActionCancel"} onClick={() => router.push('/closet')} style={{paddingLeft: isEdit ? 63 : 61, paddingRight: isEdit ? 63 : 61, paddingTop: 17, paddingBottom: 17, background: isEdit ? 'var(--Color-Danger, #C74038)' : 'var(--Color-Surface, #FFFEFB)', overflow: 'hidden', border: 0, borderRadius: 16, outline: isEdit ? '1px var(--Color-Danger, #C74038) solid' : '1px var(--Color-Line, #C2B8AB) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
      <div data-layer="Label" className="Label" style={{color: isEdit ? 'var(--Color-Surface, #FFFEFB)' : 'var(--Color-Ink, #29241F)', fontSize: 14, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>{isEdit ? "Delete" : "Cancel"}</div>
    </button>
    <button type="button" data-layer="Action / Save" className="ActionSave" onClick={() => router.push('/closet')} style={{paddingLeft: 68, paddingRight: 68, paddingTop: 17, paddingBottom: 17, background: 'var(--Color-Accent, #C7FF40)', overflow: 'hidden', border: 0, borderRadius: 16, outline: '1px var(--Color-Accent, #C7FF40) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
      <div data-layer="Label" className="Label" style={{color: 'var(--Color-Ink, #29241F)', fontSize: 14, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Save</div>
    </button>
  </div>
  <div data-layer="Frame 5" className="Frame5" style={{width: 402, height: 55, left: 0, top: 15, position: 'absolute', overflow: 'hidden'}}>
    <button type="button" aria-label="Back to Closet" data-layer="Back" className="Back" onClick={() => router.push('/closet')} style={{left: 24, top: 12, position: 'absolute', padding: 0, border: 0, background: 'transparent', color: 'var(--Color-Ink, #29241F)', fontSize: 26, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>←</button>
    <div data-layer="Title" className="Title" style={{left: 57, top: 15.50, position: 'absolute', color: 'var(--Color-Ink, #29241F)', fontSize: 20, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>Item Detail</div>
    <div data-layer="Mode" className="Mode" style={{width: 43, height: 28, left: 334, top: 13.50, position: 'absolute', background: 'var(--Color-Accent, #C7FF40)', overflow: 'hidden', borderRadius: 14}}>
      <div data-layer="Label" className="Label" style={{left: isEdit ? 8 : 10, top: 7, position: 'absolute', color: 'var(--Color-Ink, #29241F)', fontSize: 11, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>{isEdit ? "EDIT" : "ADD"}</div>
    </div>
  </div>
</div>
  );
}
