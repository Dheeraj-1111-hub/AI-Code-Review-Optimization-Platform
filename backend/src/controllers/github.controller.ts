import { Request, Response } from 'express';
import axios from 'axios';
import { Workspace } from '../models/Workspace';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

/**
 * Step 1: Redirect the user to GitHub's OAuth authorization page.
 * We embed the user's clerkId in the 'state' param so we can identify
 * them when GitHub calls back.
 */
export const initiateGitHubOAuth = async (req: Request, res: Response) => {
  const clerkId = req.user?.clerkId;
  if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

  // Encode clerkId in state so we can retrieve it in the callback
  const state = Buffer.from(JSON.stringify({ clerkId })).toString('base64');

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: 'repo read:org read:user user:email',
    state,
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  return res.redirect(githubAuthUrl);
};

/**
 * Step 2: GitHub redirects back here with a `code`.
 * Exchange it for an access_token, fetch the user's GitHub profile,
 * and save the token to the user's workspace.
 */
export const handleGitHubCallback = async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`${FRONTEND_URL}/settings?github=denied`);
  }

  if (!code || !state) {
    return res.redirect(`${FRONTEND_URL}/settings?github=error&reason=missing_params`);
  }

  try {
    // Decode state to get clerkId
    const decoded = JSON.parse(Buffer.from(state as string, 'base64').toString('utf8'));
    const { clerkId } = decoded;

    if (!clerkId) {
      return res.redirect(`${FRONTEND_URL}/settings?github=error&reason=invalid_state`);
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL,
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token, scope, token_type } = tokenResponse.data;

    if (!access_token) {
      console.error('GitHub OAuth error:', tokenResponse.data);
      return res.redirect(`${FRONTEND_URL}/settings?github=error&reason=token_exchange_failed`);
    }

    // Fetch GitHub user info to confirm the token works
    const githubUserResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    const githubUser = githubUserResponse.data;

    // Save the access token to the workspace
    const workspace = await Workspace.findOne({ ownerId: clerkId });
    if (!workspace) {
      return res.redirect(`${FRONTEND_URL}/settings?github=error&reason=workspace_not_found`);
    }

    workspace.integrations = {
      ...(workspace.integrations || {}),
      github: {
        connected: true,
        accessToken: access_token,
      }
    } as any;
    await workspace.save();

    console.log(`GitHub connected for workspace ${workspace.name} — GitHub user: ${githubUser.login}`);

    // Redirect back to settings with success
    return res.redirect(`${FRONTEND_URL}/settings?github=connected&login=${encodeURIComponent(githubUser.login)}`);
  } catch (err) {
    console.error('GitHub OAuth callback error:', err);
    return res.redirect(`${FRONTEND_URL}/settings?github=error&reason=server_error`);
  }
};

/**
 * Disconnect GitHub: removes the token from the workspace
 */
export const disconnectGitHub = async (req: Request, res: Response) => {
  try {
    const workspace = (req as any).workspace || await Workspace.findOne({ ownerId: req.user!.clerkId });
    if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found' });

    if (workspace.integrations?.github) {
      workspace.integrations.github = { connected: false };
    }
    await workspace.save();

    return res.status(200).json({ success: true, message: 'GitHub disconnected' });
  } catch (err) {
    console.error('GitHub disconnect error:', err);
    return res.status(500).json({ success: false, error: 'Failed to disconnect GitHub' });
  }
};

/**
 * Get connected GitHub user info (using stored token)
 */
export const getGitHubStatus = async (req: Request, res: Response) => {
  try {
    const workspace = (req as any).workspace || await Workspace.findOne({ ownerId: req.user!.clerkId });
    if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found' });

    const github = workspace.integrations?.github;
    if (!github?.connected || !github?.accessToken) {
      return res.status(200).json({ success: true, connected: false });
    }

    // Fetch live GitHub user info
    const githubUserResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${github.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    return res.status(200).json({
      success: true,
      connected: true,
      githubUser: {
        login: githubUserResponse.data.login,
        name: githubUserResponse.data.name,
        avatar_url: githubUserResponse.data.avatar_url,
        public_repos: githubUserResponse.data.public_repos,
      },
    });
  } catch (err: any) {
    // If the token is invalid/expired, mark as disconnected
    if (err.response?.status === 401) {
      return res.status(200).json({ success: true, connected: false, error: 'Token expired' });
    }
    return res.status(500).json({ success: false, error: 'Failed to fetch GitHub status' });
  }
};
