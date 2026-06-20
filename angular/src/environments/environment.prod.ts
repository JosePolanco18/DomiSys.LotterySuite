import { Environment } from '@abp/ng.core';

const baseUrl = 'http://192.168.10.10:8086';

const oAuthConfig = {
  issuer: 'http://192.168.10.10:8085/',
  redirectUri: baseUrl,
  clientId: 'LotterySuite_App',
  responseType: 'code',
  scope: 'offline_access LotterySuite',
  requireHttps: false,
};

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'LotterySuite',
  },
  oAuthConfig,
  apis: {
    default: {
      url: 'http://192.168.10.10:8085',
      rootNamespace: 'DomiSys.LotterySuite',
    },
    AbpAccountPublic: {
      url: oAuthConfig.issuer,
      rootNamespace: 'AbpAccountPublic',
    },
  },
  // remoteEnv: {
  //   url: '/getEnvConfig',
  //   mergeStrategy: 'deepmerge'
  // }
} as Environment;