import imgImageCloudLaundryLogo from "figma:asset/d0e24839a24076173960597a25c12b48f3330fdf.png";

function ImageCloudLaundryLogo() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Image (Cloud Laundry Logo)">
      <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgImageCloudLaundryLogo} />
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#9810fa] content-stretch flex flex-col items-start pt-[8px] px-[8px] relative rounded-[14px] size-full" data-name="Container">
      <ImageCloudLaundryLogo />
    </div>
  );
}