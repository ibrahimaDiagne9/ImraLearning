import { Award, Download, ExternalLink } from 'lucide-react';

interface Certificate {
    certificate_id: string;
    course_title: string;
    issued_at: string;
}

interface CertificateCardProps {
    certificate: Certificate;
}

export const CertificateCard = ({ certificate }: CertificateCardProps) => {
    return (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl group">
            <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-blue-400" />
                </div>
                <button className="p-2 text-gray-500 hover:text-white transition-colors">
                    <Download className="w-5 h-5" />
                </button>
            </div>

            <h3 className="text-white font-bold mb-1 line-clamp-1">{certificate.course_title}</h3>
            <p className="text-gray-500 text-sm mb-6">Issued on {new Date(certificate.issued_at).toLocaleDateString()}</p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                    ID: {certificate.certificate_id}
                </span>
                <button className="flex items-center gap-1.5 text-blue-400 text-xs font-bold hover:text-blue-300 transition-colors">
                    VIEW <ExternalLink className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};
