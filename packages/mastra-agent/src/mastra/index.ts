import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { PinoLogger } from '@mastra/loggers';
import { weatherAgent } from './agents/weather-agent';
import { bpmnAgent } from './agents/bpmn-agent';
import { weatherWorkflow } from './workflows/weather-workflow';

export const mastra = new Mastra({
	workflows: { weatherWorkflow },
	agents: { weatherAgent, bpmnAgent },
	storage: new LibSQLStore({
		// stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
		url: ':memory:',
	}),
	logger: new PinoLogger({
		name: 'Mastra',
		level: 'info',
	}),
});
