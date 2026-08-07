import { adminDb } from "@/lib/firebaseAdmin";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Briefcase, MapPin, Mail, Award, BookOpen, ExternalLink, Calendar, Code2, CheckCircle, GraduationCap } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getFacultyData(uid: string) {
  try {
    const doc = await adminDb.collection("users").doc(uid).get();
    if (!doc.exists) return null;
    const data = doc.data();
    if (data?.role !== "staff" && data?.role !== "hod") return null;

    const snap = await adminDb.collection("faculty_portfolios").where("uid", "==", uid).get();
    const portfolioItems = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    
    // Sort items by date descending
    portfolioItems.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

    return {
      user: {
        uid: doc.id,
        name: data?.name || "Faculty Member",
        email: data?.email,
        image: data?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.name || "Faculty")}&background=1e3a8a&color=fff&size=256`,
        bio: data?.bio || "",
        designation: data?.designation || "",
        qualification: data?.qualification || "",
        specialization: data?.specialization || "",
        experience: data?.experience || 0,
      },
      portfolioItems
    };
  } catch (e: any) {
    console.error("Error fetching faculty data:", e);
    return null;
  }
}

export default async function FacultyPortfolioPage({ params }: any) {
  let paramUid = "";
  try {
    paramUid = params.uid || (await params).uid;
  } catch(e) {
    paramUid = params.uid;
  }
  
  const data = await getFacultyData(paramUid);
  if (!data) return notFound();

  const { user, portfolioItems } = data;

  // Group portfolio items by type
  const education = portfolioItems.filter((i: any) => i.type === "Education");
  const experience = portfolioItems.filter((i: any) => i.type === "Experience");
  const publications = portfolioItems.filter((i: any) => i.type === "Publication" || i.type === "Journal");
  const projects = portfolioItems.filter((i: any) => i.type === "Project" || i.type === "Research");
  const certifications = portfolioItems.filter((i: any) => i.type === "Certification" || i.type === "Award");
  const others = portfolioItems.filter((i: any) => !["Education", "Experience", "Publication", "Journal", "Project", "Research", "Certification", "Award"].includes(i.type));

  const renderTimeline = (title: string, icon: any, items: any[]) => {
    if (items.length === 0) return null;
    const Icon = icon;
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <div className="p-6 md:p-8">
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
            {items.map((item) => (
              <div key={item.id} className="relative pl-8 group">
                <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-slate-200 border-2 border-white group-hover:bg-indigo-600 transition-colors duration-300" />
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                  <h4 className="text-base font-bold text-slate-800 leading-tight">{item.title}</h4>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full whitespace-nowrap">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-slate-600 leading-relaxed mb-3 whitespace-pre-wrap">{item.description}</p>
                )}
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    <ExternalLink className="h-4 w-4" /> View Reference
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Cover Image & Navigation */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-indigo-900 via-[#003087] to-blue-800 relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-6 left-6 z-10">
          <Link href="/faculty" className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium text-sm backdrop-blur-md bg-black/20 px-4 py-2 rounded-full transition-all hover:bg-black/40">
            <ArrowLeft className="h-4 w-4" /> Back to Faculty
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-24 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden sticky top-24">
              <div className="p-8 flex flex-col items-center text-center">
                <div className="h-32 w-32 rounded-full ring-4 ring-white shadow-xl overflow-hidden mb-6 bg-slate-100 relative">
                  <Image src={user.image} alt={user.name} fill className="object-cover" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h1>
                <p className="text-indigo-600 font-bold text-sm mt-1">{user.designation}</p>
                
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  {user.qualification && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                      {user.qualification}
                    </span>
                  )}
                  {user.specialization && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                      {user.specialization}
                    </span>
                  )}
                </div>

                <div className="w-full h-px bg-slate-100 my-6"></div>

                <div className="w-full space-y-4">
                  {user.experience > 0 && (
                    <div className="flex items-center gap-3 text-slate-600 justify-center">
                      <Briefcase className="h-5 w-5 text-slate-400" />
                      <span className="text-sm font-medium">{user.experience}+ Years Experience</span>
                    </div>
                  )}
                  {user.email && (
                    <div className="flex items-center gap-3 text-slate-600 justify-center">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <a href={`mailto:${user.email}`} className="text-sm font-medium hover:text-indigo-600 transition-colors">{user.email}</a>
                    </div>
                  )}
                </div>
              </div>

              {user.bio && (
                <div className="bg-slate-50 p-6 md:p-8 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">About</h3>
                  <p className="text-sm text-slate-700 leading-relaxed text-justify whitespace-pre-wrap">{user.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Portfolio Timeline */}
          <div className="lg:col-span-8 space-y-8 mt-8 lg:mt-24">
            
            {portfolioItems.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
                <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No Portfolio Items Yet</h3>
                <p className="text-slate-500 max-w-md mx-auto">This faculty member hasn't added any detailed portfolio items to their public profile yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {renderTimeline("Experience", Briefcase, experience)}
                {renderTimeline("Education", GraduationCap, education)}
                {renderTimeline("Publications & Journals", BookOpen, publications)}
                {renderTimeline("Projects & Research", Code2, projects)}
                {renderTimeline("Certifications & Awards", Award, certifications)}
                {renderTimeline("Other Activities", CheckCircle, others)}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
