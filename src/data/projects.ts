export interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
}

export const projects: Project[] = [
  //   {
  //     id: 1,
  //     title: "Bricks & Logic",
  //     description:
  //       "Bricks & Logic simplifies the UK property market by providing clear, data-driven insights and interactive tools to help homeowners, investors, and professionals make informed decisions.",
  //     imageUrl: "/project1.jpg",
  //     projectUrl: "https://www.bricksandlogic.co.uk/",
  //   },
  {
    id: 2,
    title: "Horse Racing Predictor",
    description: "A machine learning tool for predicting horse racing results",
    imageUrl: "/project2.jpg",
    projectUrl: "/horse",
  },
  {
    id: 3,
    title: "Pussy - Drinking Card Game",
    description: "A drinking card game for friends.",
    imageUrl: "/project3.jpg",
    projectUrl: "/gamereset",
  },
];
