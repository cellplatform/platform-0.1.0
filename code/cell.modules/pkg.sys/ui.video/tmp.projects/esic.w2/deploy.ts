import { Test } from 'sys.ui.dev';
import { Vercel } from 'vendor.vercel';

const Project = {
  /**
   * Deploy the project
   */
  async deploy() {
    console.log('Test', Test);
    console.log('Vercel', Vercel);
  },
};

/**
 * Run
 */
(async () => {
  await Project.deploy();
})();
