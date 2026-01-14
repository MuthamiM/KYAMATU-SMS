import React from 'react';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NewsCard = ({ announcements }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
      <div className="bg-red-500 px-4 py-3">
        <h3 className="text-white font-medium text-lg">Today's News</h3>
      </div>
      <div className="p-0">
        {announcements && announcements.length > 0 ? (
          announcements.map((news, index) => (
            <div key={index} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${news.senderName || 'A'}&background=random`} alt="User" />
                </div>
                <div className="flex-1">
                   <h4 className="text-blue-600 font-medium text-sm">{news.title}</h4>
                   <p className="text-gray-600 text-xs mt-1 line-clamp-2">{news.content}</p>
                   {/* Mockup text example: "Get Advisory On Social Distancing..." */}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-end text-xs text-gray-400">
                 <Clock className="w-3 h-3 mr-1" />
                 {news.createdAt ? formatDistanceToNow(new Date(news.createdAt), { addSuffix: true }) : 'Just now'}
              </div>
            </div>
          ))
        ) : (
            <div className="p-6 text-center text-gray-500">No news for today</div>
        )}
      </div>
    </div>
  );
};

export default NewsCard;
