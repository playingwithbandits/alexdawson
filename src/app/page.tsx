import { Section } from "@/components/Section";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/data/projects";
import { Navigation } from "@/components/Navigation";

export default function Home() {
  return (
    <>
      <header>
        <Navigation />
      </header>

      <main>
        <section id="hero">
          <h1>Alex Dawson</h1>
          <p className="subtitle">Web Developer & Designer</p>
        </section>

        <Section id="about">
          <div className="container">
            <h2>About Me</h2>
            <p className="mb-4">
              Hello! I&apos;m a web developer who loves bringing data to life
              with clean, dynamic designs. Whether it&apos;s building websites,
              creating interactive reports, or crafting infographics, I enjoy
              making information easy to understand and a pleasure to look at.
            </p>
            <p className="mb-4">
              I work with TypeScript, React, and Node.js to create web apps that
              are fast, reliable, and visually appealing. I&apos;m also
              comfortable with GraphQL and APIs, so whether it&apos;s pulling
              data or designing custom solutions, I&apos;ve got it covered. I
              pay close attention to UI designs, ensuring the final product
              looks great and works even better.
            </p>
            <p className="mb-4">
              Collaboration is a big part of what I do—I&apos;m experienced with
              tools like GitHub, BitBucket, Jira, and Trello, and I love being
              part of a team where ideas flow freely.
            </p>
            <p className="mb-4">
              When I&apos;m not coding, you&apos;ll probably find me rock
              climbing, working on my allotment, or experimenting with new
              project ideas (my latest was a machine-learning tool for
              predicting horse racing results!).
            </p>
            <p className="mb-4">
              If you&apos;re looking for someone who&apos;s passionate about
              turning ideas into beautiful, functional web experiences,
              let&apos;s connect!
            </p>
          </div>
        </Section>

        <Section id="projects">
          <div className="container">
            <h2>My Projects</h2>
            <div className="project-grid">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.description}
                  imageUrl={project.imageUrl}
                  projectUrl={project.projectUrl}
                />
              ))}
            </div>
          </div>
        </Section>

        <Section id="contact">
          <div className="container">
            <h2>Get in Touch</h2>
            <ul className="contact-info">
              <li>
                <a href="mailto:ajdawson265@gmail.com" className="contact-link">
                  <i className="fas fa-envelope"></i> ajdawson265@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/alexdawson234/"
                  target="_blank"
                  className="contact-link"
                >
                  <i className="fab fa-linkedin"></i> LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </Section>
      </main>
      <footer>
        <p>
          &copy; {new Date().getFullYear()} Alex Dawson. All rights reserved.
        </p>
      </footer>
    </>
  );
}
