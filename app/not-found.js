import Link from "next/link";
import BikeArt from "@/components/BikeArt";

export default function NotFound() {
  return (
    <div className="container-x max-w-xl pt-16 text-center">
      <BikeArt className="mx-auto w-72 opacity-60" />
      <h1 className="h-display mt-4 text-6xl text-bone">Wrong turn</h1>
      <p className="mt-2 text-steel">This page ran out of fuel.</p>
      <Link href="/" className="btn-primary mt-6">
        Back home
      </Link>
    </div>
  );
}
