/*
	server interface
    2023.1.3 Created by GuoJS
*/
interface Paper {
    info:(id:number) => Promise<string>;
    infoSync:(id:number) => string;
    questions:(id:number) => Promise<string>;
};

interface HomePage {
    carousel:() => Promise<string>;
};

interface Server {
    paper: Paper;
    home_page: HomePage;
};

export type ServerInterface = Server;
export type PaperInterface = Paper;
export type HomePageInterface = HomePage;
