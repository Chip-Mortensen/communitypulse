import Link from 'next/link';
import PageContainer from '@/components/PageContainer';

export default function AboutPage() {
  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="flex items-center mb-8">
          <svg className="w-7 h-7 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-blue-600 !mb-0">About CommunityPulse</h1>
        </div>
        
        <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8 border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Our Mission
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              CommunityPulse is a platform designed to empower citizens to identify, report, and collaborate on local issues in their communities. We believe that by working together, residents can create positive change and improve the quality of life in their neighborhoods.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our goal is to bridge the gap between citizens and local government, making it easier for community concerns to be heard and addressed. By visualizing issues on a map and enabling upvoting, we help prioritize the most pressing concerns.
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8 border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center bg-gradient-to-b from-white to-blue-50 p-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-md border border-blue-100">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-3 text-gray-800">Report Issues</h3>
                <p className="text-gray-600">
                  Identify problems in your community and report them with details, location, and photos.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center bg-gradient-to-b from-white to-blue-50 p-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-md border border-blue-100">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-3 text-gray-800">Upvote & Comment</h3>
                <p className="text-gray-600">
                  Support issues that matter to you by upvoting and adding comments with additional information.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center bg-gradient-to-b from-white to-blue-50 p-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-md border border-blue-100">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-3 text-gray-800">Collaborate</h3>
                <p className="text-gray-600">
                  Work together with neighbors and local officials to resolve issues and improve your community.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              Get Involved
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              Ready to make a difference in your community? Start by reporting an issue or exploring the map to see what concerns your neighbors have raised.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/new-issue"
                className="inline-flex justify-center items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Report an Issue
              </Link>
              <Link
                href="/"
                className="inline-flex justify-center items-center px-5 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Explore the Map
              </Link>
            </div>
          </div>
        </div>
        
        {/* Testimonials Section */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden mt-8 border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Community Voices
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-md border border-blue-100">
                    JD
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-800">Jane Doe</h3>
                    <p className="text-sm text-gray-600">Community Member</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "CommunityPulse helped our neighborhood get a dangerous intersection fixed after years of complaints. The visual map made it easy to show officials how many people were concerned about the issue."
                </p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-md border border-blue-100">
                    MS
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-800">Michael Smith</h3>
                    <p className="text-sm text-gray-600">Local Official</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "As a city council member, CommunityPulse has transformed how we identify and prioritize community issues. The upvoting system helps us understand what matters most to residents."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 