import { MdEmail, MdLocationOn } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-6 px-4 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* 🔷 Brand & Tagline */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold">HouseMatch Zambia</h3>
          <p className="text-sm text-white/70">Find your next home with confidence.</p>
        </div>

        {/* 📞 Contact & Links */}
        <div className="text-sm text-center md:text-right space-y-1">
          <p className="flex items-center justify-center md:justify-end gap-2">
            <MdEmail className="text-lg" /> chimwemwenamutowe@gmail.com
          </p>
          <p className="flex items-center justify-center md:justify-end gap-2">
            <MdLocationOn className="text-lg" /> Lusaka, Zambia
          </p>
          <div className="space-x-3 mt-2">
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Privacy</a>
          </div>
        </div>
      </div>

      {/* © Footer Bottom */}
      <div className="text-center text-xs text-white/50 mt-6">
        &copy; {new Date().getFullYear()} HouseMatch Zambia. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;