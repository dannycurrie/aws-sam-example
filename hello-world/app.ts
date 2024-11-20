import dotenv from 'dotenv';

dotenv.config();

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let message = 'DEFAULT';
    let prompt = 'What is the weather in Tokyo?';

    // if post - get prompt from body
    if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body ?? '{}');
        prompt = body.prompt ?? 'What is the weather in Tokyo?';
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
        });

        message = response.choices[0].message.content ?? 'DEFAULT';
        console.log(message);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': "'GET,OPTIONS,POST'",
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            },
            body: JSON.stringify({
                message,
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': "'GET,OPTIONS,POST'",
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            },
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
