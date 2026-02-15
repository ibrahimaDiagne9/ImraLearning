import { MessageSquare, Twitter, Github, Linkedin, Mail } from 'lucide-react';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#0B0F1A] border-t border-gray-800 mt-24 pt-16 pb-8">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-xl">I</div>
                            <span className="text-xl font-black text-white tracking-tighter">ImraLearning<span className="text-blue-500">.</span></span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Empowering the next generation of developers through community-driven learning and expert mentorship.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="p-2 bg-gray-800/50 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Platform</h4>
                        <ul className="space-y-4">
                            {['Courses', 'Discussions', 'Mentorship', 'Certificates'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm font-medium">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Resources</h4>
                        <ul className="space-y-4">
                            {['Documentation', 'Help Center', 'Blog', 'Community'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm font-medium">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Stay Updated</h4>
                        <p className="text-gray-500 text-sm font-medium">© {currentYear} ImraLearning. All rights reserved.</p>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all pr-12"
                            />
                            <button className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors">
                                <Mail className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <p>© {currentYear} ImraLearning Inc. All rights reserved.</p>
                    <div className="flex items-center gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
