"use client";

import Image from "next/image";

interface ProjectCardProps {
  title: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
}

export function ProjectCard({
  title,
  description,
  imageUrl,
  projectUrl,
}: ProjectCardProps) {
  return (
    <div className="project-card">
      <Image src={imageUrl} alt={title} width={400} height={200} />
      <h3>{title}</h3>
      <p>{description}</p>
      <a href={projectUrl} className="project-link">
        View Project
      </a>
    </div>
  );
}
