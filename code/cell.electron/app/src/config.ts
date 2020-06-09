import { Uri, constants } from './common';

Uri.ALLOW.NS = [...Uri.ALLOW.NS, constants.SYS.NS.ALLOW];
