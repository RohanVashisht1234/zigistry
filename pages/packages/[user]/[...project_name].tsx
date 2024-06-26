/*===============================================================================*/
/*                  Show Library "/packages/[user]/[project_name]"               */
/*===============================================================================*/

/*
 | Author:
 | Rohan Vashisht
 |
 | Details:
 | This page is used to display the details of a single library.
 | Please check license file for copyright details.
 */

// ===================
//       Imports
// ===================

// ----------- Types -----------
import Repo from '@/types/custom_types';

// --------- Functions ---------
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

// -------- Components ---------
import Image from 'next/image';
import { GoIssueOpened } from 'react-icons/go';
import { FaCodeFork, FaEye, FaStar } from 'react-icons/fa6';
import { Button, Card, Tooltip } from 'flowbite-react';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';
import { BsInfoSquareFill } from 'react-icons/bs';
import { Clipboard } from "flowbite-react"

// =========================================================================
//       Exports show library page "/packages/[user]/[project_name]"
// =========================================================================
export default function Manage({ compressed_repo }: { compressed_repo: Repo }) {
  return (
    <>
      {compressed_repo.contentIsCorrect ? (
        <>
          <div className='flex justify-center items-center'>
            <Card className="w-72 my-5 transition-transform transform-cpu">
              <Image width="50" height="50" className="w-10 rounded-full" src={compressed_repo.avatar_url} alt={compressed_repo.name} />
              <h5 className="text-2xl font-bold text-gray-900 dark:text-white">
                {compressed_repo.name}
              </h5>
              <p className="text-gray-400">{compressed_repo.full_name}</p>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                {compressed_repo.description}
              </p>
              <div className="flex items-center">
                <FaStar size={20} color="#cfbc0e" />
                &nbsp;{compressed_repo.stargazers_count}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <FaEye color="skyblue" />
                &nbsp;{compressed_repo.watchers_count}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <FaCodeFork color="lightpink" />
                &nbsp;{compressed_repo.forks_count}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <GoIssueOpened color="lightgreen" />
                &nbsp;{compressed_repo.open_issues}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <BsInfoSquareFill color="darkorange" />
                <Tooltip content={compressed_repo.topics?.join(", ")}>
                  &nbsp;{compressed_repo.topics?.length}
                </Tooltip>
              </div>
              <Button as={Link} target='_blank' rel="noreferrer" href={"https://github.com/" + compressed_repo.full_name} color="light" pill>
                View on Github &nbsp;<FaGithub size={20} />
              </Button>
            </Card>
          </div>
          <div className="flex mx-5 items-center justify-center font-mono">
            <div
              className="dark:bg-[#151d28] bg-slate-600 pr-7 py-3 pl-4 rounded w-fit flex items-center justify-center mb-4"
            ><span style={{ color: "gold" }}>zig</span>&nbsp;<span style={{ color: "skyblue" }}>fetch</span>&nbsp;<span style={{ color: "lightgray" }}>--save</span>&nbsp;<span style={{ color: "lightgreen" }}>{compressed_repo.specials}</span>
              <Clipboard className='ml-3' valueToCopy={"zig fetch --save " + compressed_repo.specials} label="Copy" />
            </div>
          </div>
          <div className='flex items-center justify-center mb-4'>
            <div className="dark:bg-slate-800 bg-white border-2 border-slate-600 sm:w-3/5 w-4/5 rounded-2xl py-10 sm:px-20 px-10">
              <div className="readmeDiv" dangerouslySetInnerHTML={{ __html: compressed_repo.readme_content ? DOMPurify.sanitize(compressed_repo.readme_content) : "" }}>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>404</>
      )}
    </>
  );
}

// ==================================
//       Get Server Side Props
// ==================================
export async function getServerSideProps({ params: { user, project_name } }: { params: { user: string; project_name: string; } }) {

  // -------- Get url path parameters ---------
  const repoPath = `${user}/${project_name}`;

  // ------------ Fetch Database --------------
  const response = await fetch("https://raw.githubusercontent.com/RohanVashisht1234/zigistry/main/database/main.json");
  if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
  const data: Repo[] = await response.json();

  // ------ Check if user/project exists ------
  const repository = data.find(repo => repo.full_name === repoPath);
  if (repository) {

    // -------------- Fetch Readme ------------------
    var readmeURL = repository.default_branch ? `https://raw.githubusercontent.com/${repository.full_name}/${repository.default_branch}/README.md` : `https://raw.githubusercontent.com/${repository.full_name}/master/README.md`;
    var readmeResponse = await fetch(readmeURL);
    var readmeContent = "404";
    if (readmeResponse.ok) {
      readmeContent = await readmeResponse.text();
    } else {
      readmeURL = repository.default_branch ? `https://raw.githubusercontent.com/${repository.full_name}/${repository.default_branch}/readme.md` : `https://raw.githubusercontent.com/${repository.full_name}/master/readme.md`;
      readmeResponse = await fetch(readmeURL);
      readmeContent = await readmeResponse.text();
    }

    // ----------------- Fetch tags -----------------
    const tagsResponse = await fetch(repository.tags_url);
    const tagDetails = tagsResponse.ok ? await tagsResponse.json() : [];

    // ------- Generate Installation Commands -------
    const specials = tagDetails[0]
      ? "https://github.com/" + repository.full_name + "/archive/refs/tags/" + tagDetails[0].name + ".tar.gz"
      : "git+https://github.com/" + repository.full_name

    // --------- Generate repository struct ---------
    const compressed_repo: Repo = {
      contentIsCorrect: true,
      name: repository.name,
      full_name: repository.full_name,
      readme_content: await marked(readmeContent),
      created_at: repository.created_at,
      description: repository.description,
      tags_url: repository.tags_url,
      open_issues: repository.open_issues,
      specials,
      stargazers_count: repository.stargazers_count,
      forks_count: repository.forks_count,
      watchers_count: repository.watchers_count,
      topics: repository.topics,
      avatar_url: repository.avatar_url
    };

    // ---------- Return repository struct ----------
    return { props: { compressed_repo } };
  } else {
    return { props: { compressed_repo: { contentIsCorrect: false } as Repo } };
  }
}
