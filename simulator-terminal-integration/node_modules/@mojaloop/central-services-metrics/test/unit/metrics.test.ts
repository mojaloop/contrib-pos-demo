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

 - Shashikant Hirugade <shashikant.hirugade@modusbox.com>

 --------------
 ******/

'use strict'

const Test = require('tapes')(require('tape'))
import { Metrics, metricOptionsType } from "../../src/metrics"

Test('Metrics Class Test', (metricsTest: any) => {

    metricsTest.test('setup should', (setupTest: any) => {
        setupTest.test('initialize the metrics object', async (test: any) => {
            try {
                const metrics: Metrics = new Metrics()
                const options: metricOptionsType = {
                    prefix: 'prefix1_',
                    timeout: 1000
                }
                let result = metrics.setup(options)
                test.equal(result, true, 'Result match')
                test.deepEqual(metrics.getOptions(), options, 'Options match')
                test.end()
            } catch (e) {
                test.fail(`Error Thrown - ${e}`)
                test.end()
            }
        })

        setupTest.test('initialize the metrics object with default labels', async (test: any) => {
            console.log('******STARTING********')
            try {
                const metrics: Metrics = new Metrics()
                let defaultLabels = new Map()
                defaultLabels.set('serviceName', 'testService')
                // const defaultLabels = {
                //     serviceName: 'testService'
                // }
                const options: metricOptionsType = {
                    prefix: 'prefix2_',
                    timeout: 1000,
                    defaultLabels
                }
                console.log(`options=${JSON.stringify(options)}`)
                console.log('******SET-START********')
                let result = metrics.setup(options)
                console.log('******SET-END********')
                test.equal(result, true, 'Result match')
                console.log(`options: ${JSON.stringify(metrics.getOptions())}`)
                test.deepEqual(metrics.getOptions(), options, 'Options match')
                test.end()
            } catch (e) {
                test.fail(`Error Thrown - ${e}`)
                test.end()
            }
        })

        setupTest.test('return false if setup is already initialized', async (test: any) => {
            try {
                const metrics: Metrics = new Metrics()
                const options: metricOptionsType = {
                    prefix: 'alreadySetup_',
                    timeout: 1000
                }
                metrics.setup(options)
                let result: boolean = metrics.setup(options)
                test.equal(result, false, 'Result match')
                test.end()
            } catch (e) {
                test.fail(`Error Thrown - ${e}`)
                test.end()
            }
        })

        setupTest.end()
    })

    metricsTest.test('getMetricsForPrometheus should', (getMetricsForPrometheusTest: any) => {
        getMetricsForPrometheusTest.test('return the metrics', async (test: any) => {
            try {
                const metrics: Metrics = new Metrics()
                const options: metricOptionsType = {
                    prefix: 'prefix3_',
                    timeout: 1000
                }
                metrics.setup(options)
                const histTimerEnd = metrics.getHistogram(
                    'test_metric',
                    'Histogram for test metric',
                    ['test_label']
                ).startTimer()

                histTimerEnd({ test_label: 'true' })

                const expected: string = 'prefix3_test_metric_count{test_label="true"} 1'

                let result = metrics.getMetricsForPrometheus()
                let matches = result.indexOf(expected)
                test.ok(matches != -1, 'Found the result')
                test.end()
            } catch (e) {
                console.log(e)
                test.fail(`Error Thrown - ${e}`)
                test.end()
            }
        })

        getMetricsForPrometheusTest.end()
    })

    metricsTest.test('getOptions should', (getOptionsTest: any) => {
        getOptionsTest.test('return the metrics options', async (test: any) => {
            try {
                const metrics: Metrics = new Metrics()
                const options: metricOptionsType = {
                    prefix: 'prefix4_',
                    timeout: 1000
                }
                metrics.setup(options)
                const result: metricOptionsType = metrics.getOptions()
                test.equal(options, result, 'Results Match')
                test.end()
            } catch (e) {
                console.log(e)
                test.fail(`Error Thrown - ${e}`)
                test.end()
            }
        })

        getOptionsTest.end()
    })

    metricsTest.test('getHistogram should', (getHistogramTest: any) => {
        getHistogramTest.test('return the histogram', async (test: any) => {
            try {
                const metrics: Metrics = new Metrics()
                const options: metricOptionsType = {
                    prefix: 'prefix5_',
                    timeout: 1000
                }
                const buckets: number[] = [0.010, 0.050, 0.1, 0.5, 1, 2, 3]
                const expected = {
                    name: 'prefix5_test_request',
                    help: 'Histogram for http operation',
                    aggregator: 'sum',
                    upperBounds: [0.01, 0.05, 0.1, 0.5, 1, 2, 3],
                    bucketValues: { '1': 0, '2': 0, '3': 0, '0.01': 0, '0.05': 0, '0.1': 0, '0.5': 0 },
                    sum: 0,
                    count: 0,
                    hashMap: {},
                    labelNames: ['success', 'fsp', 'operation', 'source', 'destination']
                }

                metrics.setup(options)
                const result: object = metrics.getHistogram('test_request',
                    'Histogram for http operation',
                    ['success', 'fsp', 'operation', 'source', 'destination'], buckets)
                test.deepEqual(expected, result, 'Results Match')
                test.end()
            } catch (e) {
                test.fail(`Error Thrown - ${e}`)
                test.end()
            }
        })

        getHistogramTest.test('return the histogram if help param is null', async (test: any) => {
            try {
                const metrics: Metrics = new Metrics()
                const options: metricOptionsType = {
                    prefix: 'prefix8_',
                    timeout: 100
                }
                const buckets: number[] = [0.010, 0.050, 0.1, 0.5, 1, 2, 3]
                const expected = {
                    name: 'prefix8_test_request',
                    help: 'test_request_histogram',
                    aggregator: 'sum',
                    upperBounds: [0.01, 0.05, 0.1, 0.5, 1, 2, 3],
                    bucketValues: { '1': 0, '2': 0, '3': 0, '0.01': 0, '0.05': 0, '0.1': 0, '0.5': 0 },
                    sum: 0,
                    count: 0,
                    hashMap: {},
                    labelNames: ['success', 'fsp', 'operation', 'source', 'destination']
                }

                metrics.setup(options)
                const result: object = metrics.getHistogram('test_request',
                    '',
                    ['success', 'fsp', 'operation', 'source', 'destination'], buckets)
                test.deepEqual(expected, result, 'Results Match')
                test.end()
            } catch (e) {
                test.fail(`Error Thrown - ${e}`)
                test.end()
            }
        })

        getHistogramTest.test('return the existing histogram', async (test: any) => {
            try {
                const metrics: Metrics = new Metrics()
                const options: metricOptionsType = {
                    prefix: 'prefix6_',
                    timeout: 1000
                }
                const buckets: number[] = [0.010, 0.050, 0.1, 0.5, 1, 2, 3]
                const expected = {
                    name: 'prefix6_test_request',
                    help: 'Histogram for http operation',
                    aggregator: 'sum',
                    upperBounds: [0.01, 0.05, 0.1, 0.5, 1, 2, 3],
                    bucketValues: { '1': 0, '2': 0, '3': 0, '0.01': 0, '0.05': 0, '0.1': 0, '0.5': 0 },
                    sum: 0,
                    count: 0,
                    hashMap: {},
                    labelNames: ['success', 'fsp', 'operation', 'source', 'destination']
                }

                metrics.setup(options)
                const firstResult: object = metrics.getHistogram('test_request',
                    'Histogram for http operation',
                    ['success', 'fsp', 'operation', 'source', 'destination'], buckets)
                const secondResult: object = metrics.getHistogram('test_request',
                    'Histogram for http operation',
                    ['success', 'fsp', 'operation', 'source', 'destination'], buckets)
                test.deepEqual(expected, secondResult, 'Results Match')
                test.end()
            } catch (e) {
                test.fail(`Error Thrown - ${e}`)
                test.end()
            }
        })

        // TODO: Fix this test to get 100% coverage
        // getHistogramTest.test('return the error while getting histogram', async (test: any) => {
        //     try {

        //         const buckets: number[] = [0.010, 0.050, 0.1, 0.5, 1, 2, 3]

        //         const metrics: Metrics = new Metrics()
        //         console.log(JSON.stringify(metrics))
        //         const options: metricOptionsType = {
        //             prefix: 'prefix7_',
        //             timeout: 1000
        //         }
        //         metrics.setup(options)

        //         const result: object = metrics.getHistogram('test_request_fake',
        //             'Histogram for http operation',
        //             ['success', 'fsp', 'operation', 'source', 'destination'], buckets)
        //         test.fail('Error Thrown')
        //         test.end()

        //     } catch (e) {
        //         test.ok(e instanceof Error)
        //         test.end()
        //     }
        // })

        getHistogramTest.end()
    })

    metricsTest.end()
})
