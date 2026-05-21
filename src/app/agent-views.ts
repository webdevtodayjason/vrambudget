/**
 * Central import point for AVL route registrations.
 *
 * Each registrar helper pushes its routes into `AGENT_ROUTES` at module
 * load. The postbuild emitter (`scripts/emit-agent-views.ts`) imports
 * this file once, then walks the registry to write `out/<route>.agent`
 * files plus the `out/agent.txt` manifest.
 */
import { registerHomeView } from './_views/home';
import { registerMathView } from './_views/math';
import { registerGpuIndexView } from './_views/gpu-index';
import { registerModelIndexView } from './_views/model-index';
import { registerRuntimeIndexView } from './_views/runtime-index';
import { registerAllGpuViews } from './_views/all-gpus';
import { registerAllModelViews } from './_views/all-models';
import { registerAllRuntimeViews } from './_views/all-runtimes';

registerHomeView();
registerMathView();
registerGpuIndexView();
registerModelIndexView();
registerRuntimeIndexView();
registerAllGpuViews();
registerAllModelViews();
registerAllRuntimeViews();
