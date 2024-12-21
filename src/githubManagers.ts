import { Octokit } from "@octokit/rest";
import { ChangeLog } from "./types";

export class GithubManager {
    private octokit :Octokit;
    private owner: string;
    private repo: string;
    private branchName = 'code-tracking';

    constructor(token: string, repoFullName: string){
        this.octokit = new Octokit({auth: token});
        [this.owner, this.repo] = repoFullName.split('/');
    }

    async createBranch(): Promise<void>{
        const {data:ref} = await this.octokit.git.getRef({
            owner: this.owner,
            repo: this.repo,
            ref: 'heads/main'
        });

        try {
            await this.octokit.git.createRef({
                owner : this.owner,
                repo: this.repo,
                ref: `refs/heads/${this.branchName}`,
                sha: ref.object.sha
            })
        } catch(err){
            if(err.stats !== 422){
                throw err
            }
        }
    }

    async pushChanges(log: ChangeLog):Promise<void>{
        const timestamp = new Date().toISOString();
        const content = this.createMarkdownContent(log);

        const {data: currentCommit} = await this.octokit.repos.getContent({
            owner: this.owner,
            repo: this.repo,
            path: `logs/${timestamp}.md`,
            ref: this.branchName
        }).catch(() => ({data: null}))

        await this.octokit.repos.createOrUpdateFileContents({
            owner: this.owner,
            repo: this.repo,
            path: `logs/${timestamp}.md`,
            message: `Update code tracking log - ${timestamp}`,
            content: Buffer.from(content).toString('base64'),
            branch: this.branchName,
            sha: currentCommit?.sha
        });
    }

    private async createMarkdownContent(log: ChangeLog):string{
        return `# Code Changes - ${new Date().toISOString()}
        
        ## Summary
        ${log.summary}
        
        ## Changges
        ${log.changes.map(change => `- ${change.file}: ${change.description}`).join('\\n')}
        
        
        ## Stats
        - Files Changed: ${log.stats.filesChanged}
        - Lines Added: ${log.stats.linesAdded}
        - Lines Deleted: ${log.stats.linesDeleted}
        `;
    }

    
}