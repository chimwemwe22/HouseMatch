import { FaHome, FaCommentDots, FaLock } from "react-icons/fa";

const AboutSection = () => {
  return (
    <section className="bg-white py-16 px-6 border-t border-slate">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-teal mb-4">
          Why HouseMatch Zambia?
        </h2>
        <p className="text-slate text-base mb-10 max-w-3xl mx-auto">
          We believe your next home shouldn't be a gamble. HouseMatch connects verified landlords
          with serious house seekers to create real, secure rental experiences across Zambia.
          Whether you're moving cities or growing your portfolio — we've built the platform for you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-teal text-white rounded-xl p-6 shadow-md transition duration-300 hover:shadow-xl hover:scale-[1.03] hover:bg-teal-600 cursor-pointer">
            <FaHome className="text-3xl mb-4 mx-auto transition duration-300 hover:text-white" />
            <h3 className="text-lg font-semibold mb-2">Verified Listings</h3>
            <p className="text-sm">
              Every property goes through admin review before it’s approved for seekers.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-teal text-white rounded-xl p-6 shadow-md transition duration-300 hover:shadow-xl hover:scale-[1.03] hover:bg-teal-600 cursor-pointer">
            <FaCommentDots className="text-3xl mb-4 mx-auto transition duration-300 hover:text-white" />
            <h3 className="text-lg font-semibold mb-2">Seamless Communication</h3>
            <p className="text-sm">
              Landlords and seekers interact through secure dashboards and messages.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-teal text-white rounded-xl p-6 shadow-md transition duration-300 hover:shadow-xl hover:scale-[1.03] hover:bg-teal-600 cursor-pointer">
            <FaLock className="text-3xl mb-4 mx-auto transition duration-300 hover:text-white" />
            <h3 className="text-lg font-semibold mb-2">Secure Access</h3>
            <p className="text-sm">
              Role-based authentication and listing protection tailored for every user.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;