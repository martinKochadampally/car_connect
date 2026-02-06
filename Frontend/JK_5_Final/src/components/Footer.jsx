import React from 'react';

function Footer({ name, email }) {
  return (
    <footer className="bg-black text-white text-center py-4">
      <div className="text-sm">
        Developed by {name} &middot; <a href={`mailto:${email}`} className="underline hover:text-orange-400">{email}</a>
      </div>
      <div className="text-xs mt-1 text-gray-400">© {new Date().getFullYear()} Car Connect.</div>
    </footer>
  );
}

export default Footer;