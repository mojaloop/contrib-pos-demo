/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 - Pedro Barreto <pedrob@crosslaketech.com>
 - Rajiv Mothilal <rajivmothilal@gmail.com>
 - Miguel de Barros <miguel.debarros@modusbox.com>
 - Shashikant Hirugade <shashikant.hirugade@modusbox.com>

 --------------
 ******/
import client = require('prom-client');
/**
 * Type that represents the options that are required for setup
 */
declare type metricOptionsType = {
    timeout: number;
    prefix: string;
    defaultLabels?: Map<string, string>;
};
/** Wrapper class for prom-client. */
declare class Metrics {
    /** To make sure the setup is run only once */
    private _alreadySetup;
    /** Object containing the histogram values */
    private _histograms;
    /** The options passed to the setup */
    private _options;
    /**
     * Setup the prom client for collecting metrics using the options passed
     */
    setup: (options: metricOptionsType) => boolean;
    /**
     * Get the histogram values for given name
     */
    getHistogram: (name: string, help?: string | undefined, labelNames?: string[] | undefined, buckets?: number[]) => client.Histogram;
    /**
     * Get the metrics
     */
    getMetricsForPrometheus: () => string;
    /**
     * Get the options that are used to setup the prom-client
     */
    getOptions: () => metricOptionsType;
}
export { Metrics, metricOptionsType };
