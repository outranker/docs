import React from "react";

const Footer = () => {
  return (
    <div className="flex flex-col w-full px-10">
      <div className="flex flex-col w-full">
        <div className="grid grid-cols-1 grid-rows-4 md:grid-cols-2 md:grid-rows-2 xl:grid-cols-4 xl:grid-rows-1 mt-5 gap-5">
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Features</span>
            <span className="mt-2 text-sm">Home</span>
            <span className="mt-2 text-sm">Docs</span>
            <span className="mt-2 text-sm">Blog</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Support</span>
            <span className="mt-2 text-sm">tryhanalabs.com</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Support</span>
            <span className="mt-2 text-sm">tryhanalabs.com</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Social Link</span>
            <span className="mt-2 text-sm">Github</span>
            <span className="text-sm">Twitter</span>
            <span className="text-sm">LinkedIn</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <span className="font-semibold">
          {new Date().getFullYear()} ©{" "}
          <a href="https://tryintent.com" target="_blank">
            Intent
          </a>
        </span>
      </div>
    </div>
  );
};

export default Footer;