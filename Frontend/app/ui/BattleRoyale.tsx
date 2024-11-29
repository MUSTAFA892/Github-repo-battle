"use client";

import { ReactTyped } from "react-typed";
import { SubmissionLoader } from "@/app/ui/loader";
import { useState } from "react";
import Image from "next/image";
import { StaticImageData } from "next/image";
import dummyImg from "@/public/dummy.png";
import { fetchReadme } from "@varandas/fetch-readme";
import markdownit from "markdown-it";
import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import mockAnimation from "@/public/animations/mock.gif";

// init the markdown-it
const md = new markdownit();

interface userData {
  name: string;
  blog?: string;
  location?: string;
  company?: string;
  bio?: string;
  followers?: number;
  following?: number;
  public_repos?: number;
  profileReadme?: string;
  reposReadme: {
    name: string;
    readme: string;
  }[];
}

const lambdaUrl =
  "https://ab53hahe57.execute-api.us-east-1.amazonaws.com/Production/maaf-karo";

function UrlToFetch(userName: string) {
  return {
    profile: `https://api.github.com/users/${userName}`,
    profileReadme: `https://raw.githubusercontent.com/${userName}/${userName}/main/README.md`,
    profileRepos: `https://api.github.com/users/${userName}/repos?per_page=1000`, // to get all repos
  };
}

export function BattleRoyale() {
  // Generate a unique form id
  const formId = uuidv4();

  // States
  const [user1Image, setUser1Image] = useState<StaticImageData | null>(null);
  const [user2Image, setUser2Image] = useState<StaticImageData | null>(null);
  const [fetchedStatus, setFetchedStatus] = useState<string>("Battle 🔥");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [AIResponse, setAIResponse] = useState<string | null>(null);

  // Add this ref
  const responseContainerRef = useRef<HTMLDivElement>(null);

  // Get the github data
  async function getGithubData(userNo: number, userName: string) {
    const userData: userData = {
      name: "",
      reposReadme: [],
    };

    // Get all urls to fetch
    const urls = UrlToFetch(userName);

    try {
      // Fetch the user profile
      setFetchedStatus("profile...");
      let response = await fetch(urls.profile, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      // Get the profile data and update the userImage
      let data = await response.json();
      // Update data and states
      if (userNo === 1) {
        setUser1Image(data.avatar_url);
      } else {
        setUser2Image(data.avatar_url);
      }
      userData.name = data.name;
      userData.blog = data.blog || null;
      userData.location = data.location || null;
      userData.company = data.company || null;
      userData.bio = data.bio || null;
      userData.followers = data.followers || 0;
      userData.following = data.following || 0;
      userData.public_repos = data.public_repos || 0;

      // Fetch the user readme
      setFetchedStatus("readme...");
      try {
        await fetchReadme({
          username: userName,
          repository: userName,
        }).then((readme) => {
          userData.profileReadme = readme;
        });
      } catch (error) {
        userData.profileReadme = "No readme found";
      }

      // Fetch the user repos
      setFetchedStatus("repos...");
      response = await fetch(urls.profileRepos, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      data = await response.json();
      // Get the repos with star or fork
      const reposWithStarOrFork = data.filter(
        (repo: any) => repo.stargazers_count > 0 || repo.forks > 0
      );
      // Get the repos names
      const reposNames = await reposWithStarOrFork.map(
        (repo: any) => repo.name
      );

      // Fetch the repos data
      setFetchedStatus("repos data...");
      for (const repo of reposNames) {
        try {
          const readme = await fetchReadme({
            username: userName,
            repository: repo,
          });
          userData.reposReadme.push({
            name: repo,
            readme: readme,
          });
        } catch (error) {
          userData.reposReadme.push({
            name: repo,
            readme: "No readme found",
          });
        }
      }
      // Parse all the data to json string
      const userParsedData = JSON.stringify(userData);
      return userParsedData;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // Handle the form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default action & update the state
    e.preventDefault();
    setIsFetching(true);
    setAIResponse(null);

    // Get the data from the form
    const formData = new FormData(e.target as HTMLFormElement);
    const userName1 = formData.get("userName1") as string;
    const userName2 = formData.get("userName2") as string;
    const formIdFromForm = formData.get("formId") as string;

    // eliminate any terminal based attack
    if (formIdFromForm !== formId) {
      setFetchedStatus("Get feedback");
      setIsFetching(false);
      setAIResponse("");
      setUser1Image(null);
      setUser2Image(null);
      return;
    }

    if (userName1 === userName2) {
      setFetchedStatus("Get feedback");
      setIsFetching(false);
      setAIResponse("Same username, pls don't trick me.");
      setUser1Image(null);
      setUser2Image(null);
      return;
    }

    try {
      // Fetch the users data
      const userParsedData1 = await getGithubData(1, userName1);
      const userParsedData2 = await getGithubData(2, userName2);

      // Call the genai lambda function & send teh converted json data
      setFetchedStatus("Battling...");
      const genaiResponse = await fetch(lambdaUrl, {
        method: "POST",
        body: JSON.stringify({
          userName1: userName1,
          userData1: userParsedData1,
          userName2: userName2,
          userData2: userParsedData2,
          task: "battle",
        }),
      });

      const genaiResponseData = await genaiResponse.json();
      if (genaiResponseData.statusCode === 200) {
        const parsedData = JSON.parse(genaiResponseData.body);
        const markdownParsedData = md.render(parsedData.message);
        setAIResponse(markdownParsedData || "No response generated");
      } else {
        setFetchedStatus("Get feedback");
        setUser1Image(null);
        setUser2Image(null);
        setAIResponse("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      // implement toast here
      setFetchedStatus("Get feedback");
      setAIResponse(
        "Incorrect username (most probably) or some error occured(very rare)"
      );
    } finally {
      setIsFetching(false);
      setFetchedStatus("Less Go");
    }
  };

  // Set the form id
  useEffect(() => {
    document.getElementById("formId")?.setAttribute("value", formId);
  });

  // Add event listerner to when the typing is happening and the height changed
  useEffect(() => {
    if (AIResponse && responseContainerRef.current) {
      const scrollToBottom = () => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      };
      // Create an observer to watch for height changed
      const resizeObserver = new ResizeObserver(() => {
        scrollToBottom();
      });
      // Start observing the response container
      resizeObserver.observe(responseContainerRef.current as Element);

      // Cleanup
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [AIResponse]);

  return (
    <section
      id="maaf-karo"
      className="flex flex-col w-full h-fit items-center justify-center p-4 sm:p-8 gap-4"
    >
      <div className="text-sm sm:text-base new-app w-full h-fit flex items-start">
        <Link href={"/"}>
          <span className="underline decoration-cyan-500">
            Try Legendary Royale!
          </span>
          🔥
        </Link>
      </div>
      <div className="page-wrapper w-full h-fit flex flex-col items-center justify-center gap-14">
        <div className="pics w-full h-fit flex flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12">
          <div className="user-pic w-fit h-fit transform transition-transform hover:scale-105 duration-300">
            <Image
              src={user1Image ? (user1Image as StaticImageData) : dummyImg}
              alt="user"
              width={200}
              height={200}
              className="rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)] object-cover  border-4 border-black"
            />
          </div>
          <div className="vs-symbol flex flex-col items-center gap-2">
            <div className="text-sm sm:text-base md:text-xl lg:text-4xl font-black bg-black text-white px-2 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-xl shadow-lg transform hover:scale-110 transition-transform duration-300">
              VS
            </div>
            <div className="md:w-32 w-11 sm:w-20 h-1 bg-gradient-to-r from-transparent via-black to-transparent"></div>
          </div>
          <div className="user-pic w-fit h-fit transform transition-transform hover:scale-105 duration-300">
            <Image
              src={user2Image ? (user2Image as StaticImageData) : dummyImg}
              alt="user"
              width={200}
              height={200}
              className="rounded-full aspect-square shadow-[0_0_20px_rgba(0,0,0,0.2)] object-cover object-center border-4 border-black"
            />
          </div>
        </div>
        <div className="form w-full max-w-2xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative flex flex-col w-full items-center gap-4 sm:gap-6 md:gap-8"
          >
            <div className="relative name-email flex flex-row gap-3 sm:gap-6 w-full justify-center items-center px-2 sm:px-3">
              <label
                htmlFor="userName1"
                className="user-name relative w-[49.5%] max-w-[250px] h-fit"
              >
                <input
                  minLength={2}
                  disabled={isFetching}
                  autoComplete="off"
                  required
                  placeholder="username 1 😅"
                  type="text"
                  name="userName1"
                  id="userName1"
                  className="text-sm relative z-10 rounded-xl px-4 py-3 border-2 border-neutral-300 w-full h-12 bg-white sm:text-base outline-none hover:border-black focus:border-black transition-colors duration-300 text-neutral-800 placeholder:text-neutral-400"
                />
                <div className="text-sm sm:text-balance placeholder absolute z-20 top-0 left-2 -translate-y-1/2 px-2 bg-white text-black font-medium font-mono">
                  github
                </div>
              </label>

              <label
                htmlFor="userName2"
                className="legend-select relative w-[49.5%] max-w-[250px] h-fit"
              >
                <input
                  minLength={2}
                  disabled={isFetching}
                  autoComplete="off"
                  required
                  placeholder="username 2 😅"
                  type="text"
                  name="userName2"
                  id="userName2"
                  className="text-sm relative z-10 rounded-xl px-4 py-3 border-2 border-neutral-300 w-full h-12 bg-white sm:text-base outline-none hover:border-black focus:border-black transition-colors duration-300 text-neutral-800 placeholder:text-neutral-400"
                />
                <div className="text-sm sm:text-balance placeholder absolute z-20 top-0 left-2 -translate-y-1/2 px-2 bg-white text-black font-medium font-mono">
                  github
                </div>
              </label>
            </div>
            <input
              required
              type="text"
              name="formId"
              id="formId"
              className="hidden"
              hidden
            />
            <div className="buttons flex flex-row items-center justify-center gap-6">
              <button
                disabled={isFetching}
                onClick={() => {
                  setUser1Image(null);
                  setUser2Image(null);
                  setAIResponse(null);
                }}
                type="reset"
                className={`w-32 h-12 rounded-xl bg-white border-2 border-black text-black font-medium transition-colors duration-300 ${
                  isFetching
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-red-700 hover:text-white"
                }`}
              >
                Reset
              </button>
              <button
                disabled={isFetching}
                type="submit"
                className={`w-36 h-12 rounded-xl bg-black font-semibold text-white  transition-colors duration-300 flex flex-row items-center justify-center gap-2 ${
                  isFetching
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:border-2 hover:border-black"
                }`}
              >
                <span>{fetchedStatus}</span>

                {isFetching && (
                  <SubmissionLoader color="pink" height="20px" width="20px" />
                )}
              </button>
            </div>
          </form>
        </div>

        {AIResponse === null || undefined ? (
          <div className="mock-animation w-full max-w-2xl mx-auto flex items-center justify-center">
            <Image src={mockAnimation} alt="mock" width={200} height={200} />
          </div>
        ) : (
          <div
            ref={responseContainerRef}
            className="response-container w-full max-w-2xl mx-auto"
          >
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.1)] transform transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,0,0,0.15)]">
              <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-neutral-200">
                Response 🔥
              </h3>
              <div className="response-text">
                <ReactTyped
                  strings={[AIResponse]}
                  typeSpeed={17}
                  className="text-neutral-700 font-medium leading-relaxed"
                  showCursor={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
