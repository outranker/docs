import React from "react";
import { PiPencilSimpleLineLight } from "react-icons/pi";
import { PiShootingStar } from "react-icons/pi";
import { MdOutlineMessage } from "react-icons/md";
import { PiHandHeart } from "react-icons/pi";
import { PiNote } from "react-icons/pi";
import { PiArrowUpRightBold } from "react-icons/pi";
import { Enterprise } from "../components/images/providers";
import Link from "next/link";

const CommunityData = [
  {
    Icon: PiPencilSimpleLineLight,
    title: "Edit this page",
    ArrowIcon: PiArrowUpRightBold,
  },
  {
    Icon: PiShootingStar,
    title: "Star on GuitHub",
    ArrowIcon: PiArrowUpRightBold,
  },
  {
    Icon: MdOutlineMessage,
    title: "Chat on Discord",
    ArrowIcon: PiArrowUpRightBold,
  },
  {
    Icon: PiHandHeart,
    title: "Become a Sponsor",
    ArrowIcon: PiArrowUpRightBold,
  },
  {
    Icon: PiNote,
    title: "Give us Feedback",
    ArrowIcon: PiArrowUpRightBold,
  },
];

const Community = () => {
  return (
    <div>
      <p className="nx-mb-3.5 nx-font-semibold nx-tracking-tight">Community</p>
      <ul>
        {CommunityData.map((item, index) => (
          <li className="nx-my-2 nx-scroll-my-6 nx-scroll-py-6" key={index}>
            <a className="nx-font-semibold nx-inline-block nx-text-gray-500 hover:nx-text-gray-900 dark:nx-text-gray-400 dark:hover:nx-text-gray-300 contrast-more:nx-text-gray-900 contrast-more:nx-underline contrast-more:dark:nx-text-gray-50 nx-w-full nx-break-words">
              <span className="flex flex-row items-center gap-2 cursor-pointer">
                <item.Icon />
                {item.title}
                <item.ArrowIcon />
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-3">
        <p className="nx-mb-3.5 nx-font-semibold nx-tracking-tight">
          Enterprise
        </p>

        <Link href={"https://tryhanalabs.com/"} target="_blank">
          <div className="flex flex-col nx-my-2 bg-[#1d2429] border border-[#282829] rounded-md hover:border-primary cursor-pointer">
            <Enterprise />

            <div className="flex flex-col p-2 text-center">
              <span className="nx-text-gray-400 text-md font-semibold">
                Need custom development or support? Contact us.
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Community;
