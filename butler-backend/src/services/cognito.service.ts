import AWS from 'aws-sdk';
import { AttributeListType, ConfirmSignUpRequest, SignUpRequest } from 'aws-sdk/clients/cognitoidentityserviceprovider';
import crypto from 'crypto';

export default class CognitoService {

  private config = {
    apiVersion: '2021-09-25',
    region: 'us-east-2',
  }

  private secretHash: string = '1jblato2oi3ik9mmmibhe1itl2epb7pnfuma9l07hvm97h0kinnq'
  private clientId: string = '2l23dnild159hee0pekq97avd1';

  private cognitoIdentity: AWS.CognitoIdentityServiceProvider;

  constructor() {
    this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider(this.config)
  }

  private hashSecret(username: string): string {
    return crypto.createHmac('SHA256', this.secretHash)
      .update(username + this.clientId)
      .digest('base64')
  }

  public async signUpUser(username: string, password: string, userAttr: AttributeListType): Promise<boolean> {

    var params: SignUpRequest = {
      ClientId: this.clientId,
      Password: password,
      Username: username,
      SecretHash: this.hashSecret(username),
      UserAttributes: userAttr,
    };

    return this.cognitoIdentity.signUp(params).promise()
      .then(
        () => {
          console.log('User signup successfully!');

          return true;
        },
        (error) => {
          console.error('User signup failed!' + error.message);

          return false;
        }
      );
  }

  public async signInUser(username: string, password: string): Promise<boolean> {

    var params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.clientId,
      AuthParameters: {
        'USERNAME': username,
        'PASSWORD': password,
        'SECRET_HASH': this.hashSecret(username)
      },
    };

    return this.cognitoIdentity.initiateAuth(params).promise()
      .then(
        () => {
          console.log('User signin successfully!');

          return true;
        },
        (error) => {
          console.error('User signin failed!' + error.message);

          return false;
        }
      );
  }

  public async confirmSignUp(username: string, code: string): Promise<boolean> {

    var params: ConfirmSignUpRequest = {
      ClientId: this.clientId,
      ConfirmationCode: code,
      Username: username,
      SecretHash: this.hashSecret(username),
    };

    return this.cognitoIdentity.confirmSignUp(params).promise()
      .then(
        () => {
          console.log('User Account Confirm successfully!');

          return true;
        },
        (error) => {
          console.error('User Account Confirm  failed!' + error.message);

          return false;
        }
      );
  }

}