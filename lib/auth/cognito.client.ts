import {
  ChangePasswordCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  RevokeTokenCommand,
  SignUpCommand,
  type AuthenticationResultType,
} from "@aws-sdk/client-cognito-identity-provider";
import type { SessionTokens, StudentAuthConfig } from "./types";

function tokens(
  result: AuthenticationResultType | undefined,
  refreshToken?: string,
): SessionTokens {
  const refresh = result?.RefreshToken ?? refreshToken;
  if (!result?.AccessToken || !result.IdToken || !result.ExpiresIn || !refresh) {
    throw new Error(
      "Sign-in could not be completed. Please contact the school if this continues.",
    );
  }
  return {
    accessToken: result.AccessToken,
    idToken: result.IdToken,
    refreshToken: refresh,
    expiresAt: Date.now() + result.ExpiresIn * 1000,
  };
}

export function createCognitoClient(config: StudentAuthConfig) {
  const client = new CognitoIdentityProviderClient({ region: config.region });
  const ClientId = config.clientId;
  return {
    async signIn(email: string, password: string) {
      const result = await client.send(
        new InitiateAuthCommand({
          ClientId,
          AuthFlow: "USER_PASSWORD_AUTH",
          AuthParameters: { USERNAME: email.trim(), PASSWORD: password },
        }),
      );
      if (result.ChallengeName) {
        throw new Error(
          "This account requires an additional sign-in step. Please contact the school.",
        );
      }
      return tokens(result.AuthenticationResult);
    },
    async refresh(refreshToken: string) {
      const result = await client.send(
        new InitiateAuthCommand({
          ClientId,
          AuthFlow: "REFRESH_TOKEN_AUTH",
          AuthParameters: { REFRESH_TOKEN: refreshToken },
        }),
      );
      return tokens(result.AuthenticationResult, refreshToken);
    },
    async signUp(email: string, password: string) {
      const result = await client.send(
        new SignUpCommand({
          ClientId,
          Username: email.trim(),
          Password: password,
          UserAttributes: [{ Name: "email", Value: email.trim() }],
        }),
      );
      return result.UserConfirmed === true;
    },
    async confirm(email: string, code: string) {
      await client.send(
        new ConfirmSignUpCommand({
          ClientId,
          Username: email.trim(),
          ConfirmationCode: code.trim(),
        }),
      );
    },
    async resend(email: string) {
      await client.send(
        new ResendConfirmationCodeCommand({ ClientId, Username: email.trim() }),
      );
    },
    async requestReset(email: string) {
      await client.send(new ForgotPasswordCommand({ ClientId, Username: email.trim() }));
    },
    async confirmReset(email: string, code: string, password: string) {
      await client.send(
        new ConfirmForgotPasswordCommand({
          ClientId,
          Username: email.trim(),
          ConfirmationCode: code.trim(),
          Password: password,
        }),
      );
    },
    async changePassword(
      accessToken: string,
      previousPassword: string,
      proposedPassword: string,
    ) {
      await client.send(
        new ChangePasswordCommand({
          AccessToken: accessToken,
          PreviousPassword: previousPassword,
          ProposedPassword: proposedPassword,
        }),
      );
    },
    async revoke(refreshToken: string) {
      await client.send(new RevokeTokenCommand({ ClientId, Token: refreshToken }));
    },
  };
}
