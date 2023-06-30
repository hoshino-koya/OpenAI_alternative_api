import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ReactNode, useEffect, useState } from "react";
import { MockAction } from "../lib/rcMock";
import { Action } from "../lib/types";
import { classNames } from "../lib/utils";
import { useProfile } from "./contextManagers/profile";
import PlaygroundChatbot from "./playgroundChatbot";
import SelectBox from "./selectBox";

const languageOptions: {
  id: string;
  name: "English" | "Espanol";
  icon: ReactNode;
}[] = [
  {
    id: "EN",
    name: "English",
    icon: <img alt="US" className="h-4 mr-2" src={"us.jpg"} />,
  },
  {
    id: "ES",
    name: "Espanol",
    icon: <img alt="Spain" className="h-4 mr-2" src={"spain.jpg"} />,
  },
];

export default function Playground() {
  const supabase = useSupabaseClient();
  const [language, setLanguage] = useState("EN");
  const [userApiKey, setUserApiKey] = useState("");

  const { profile } = useProfile();
  const [numActions, setNumActions] = useState<number>(0);

  useEffect(() => {
    localStorage.getItem("userApiKey") &&
      setUserApiKey(localStorage.getItem("userApiKey") as string);
  }, []);

  useEffect(() => {
    (async () => {
      if (profile) {
        const res2 = await supabase
          .from("actions")
          .select("*", { head: true, count: "exact" })
          .eq("org_id", profile.org_id)
          .is("active", true);
        if (res2.error) throw res2.error;
        setNumActions(res2.count ?? 0);
      }
    })();
  }, [profile]);

  return (
    <>
      <main className="fixed left-0 right-72 top-16 bottom-0">
        <PlaygroundChatbot
          page={"RControl"}
          setPage={() => {}}
          language={
            languageOptions.find((item) => item.id === language)?.name ??
            "English"
          }
          userApiKey={userApiKey}
          submitReady={
            numActions > 0
            // numActions > 0 &&
            // !!profile?.organizations?.api_host &&
            // profile?.organizations?.api_host.length > 0
          }
        />
      </main>
      <div className="fixed bottom-0 right-0 top-16 z-50 flex w-72 flex-col border-t border-gray-700">
        <div className="relative bg-gray-800 flex flex-1 flex-col gap-y-5 overflow-y-auto border-l border-gray-700 px-6 pb-4">
          <div className="mt-6">
            <SelectBox
              title="Language"
              options={languageOptions}
              theme={"dark"}
              selected={language}
              setSelected={setLanguage}
            />
          </div>
        </div>
        <div className="fixed bottom-0 right-0 w-72 bg-gray-900 py-4 px-4">
          <h2 className="text-gray-100 text-little font-semibold">
            Your API Key
          </h2>
          <p className="text-gray-400 text-sm">
            To call your API, we might need an API key. This is passed in the
            Authorization header.
          </p>
          <input
            className="rounded mt-2 px-2 py-1"
            value={userApiKey}
            onChange={(e) => setUserApiKey(e.target.value)}
            onBlur={() => {
              localStorage.setItem("userApiKey", userApiKey);
            }}
          />
          <p className="w-full text-center text-gray-300 mt-0.5 text-sm">
            We never store this in our database.
          </p>
        </div>
      </div>
    </>
  );
}

function Card(props: {
  active: boolean;
  handleStateChange: (action: MockAction) => void;
  action: MockAction;
}) {
  return (
    <button
      onClick={() => props.handleStateChange(props.action)}
      className={classNames(
        props.active
          ? "border-purple-700 ring-2 ring-purple-700"
          : "border-gray-700",
        "relative flex cursor-pointer rounded-lg border p-2.5 shadow-sm focus:outline-none text-left bg-gray-900 hover:bg-gray-950"
      )}
    >
      <div className="flex flex-col w-full max-h-32 truncate">
        <span
          className="font-medium text-gray-200"
          style={{ maxWidth: "calc(100% - 2rem)" }}
        >
          {props.action.name}
        </span>
        <span className="mt-1 text-sm text-gray-400 truncate whitespace-pre-wrap">
          {props.action.description}
        </span>
      </div>
      <span className="flex-shrink-0 rounded-full bg-900">
        <CheckCircleIcon
          className={classNames(
            !props.active ? "invisible" : "",
            "h-5 w-5 text-purple-700"
          )}
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
