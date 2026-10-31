import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-daylight px-5 text-center">
      <p className="text-[14px] text-black/45">404</p>
      <h1 className="mt-3 text-[40px] font-light text-black/85">This page wandered off.</h1>
      <Link href="/" className="mt-8 rounded-full bg-white/70 px-5 py-2 text-[15px] font-medium text-black/75 backdrop-blur-[10px]">
        Back to Velowen
      </Link>
    </div>
  );
}
