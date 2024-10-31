console.log('start-lambda', 'Iniciando lambda...');
const { handler } = require('./build/src/index');
const isInLambda = !!process.env.LAMBDA_TASK_ROOT;

if (isInLambda) {
    exports.handler = async (event, context) => {
        try {
            await handler(event);
        } catch (error) {
            console.error("Error ejecutando Lambda:", error);
            throw error;
        }
    };
} else {
    console.error('Error executing as lambda.');
}