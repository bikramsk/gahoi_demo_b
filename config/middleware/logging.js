module.exports = () => {
  return async (ctx, next) => {
    console.log('Incoming request:', {
      path: ctx.path,
      method: ctx.method,
      hasAuth: !!ctx.request.header.authorization,
      query: ctx.query
    });

    await next();

    console.log('Response:', {
      status: ctx.status,
      hasBody: !!ctx.body
    });
  };
};