"use client";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="grid h-[420px] place-items-center rounded-2xl bg-graphite text-sm text-gunmetal">Loading map...</div>
});

export default function Map(props) {
  return <LeafletMap {...props} />;
}
