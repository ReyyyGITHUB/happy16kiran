import React from "react";
import PersonalMsgDivider from "./PersonalMsgDivider";
import PersonalMsgSignature from "./PersonalMsgSignature";
import PersonalMsgText from "./PersonalMsgText";

export default function PersonalMsg() {
  return (
    <div className="w-full bg-[#fafafa]">
      <div className="mx-auto flex w-full max-w-250 flex-col items-center py-10 text-center sm:px-10 md:px-1 sm:text-left">
        <div className="w-full rounded-3xl px-4">
          <PersonalMsgText />
          <PersonalMsgDivider />
          <PersonalMsgSignature />
        </div>
      </div>
    </div>
  );
}
