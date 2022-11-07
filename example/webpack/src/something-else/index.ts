interface Event {}
interface Context {}
type Callback = (err?: unknown) => void

export const event = async (event: Event, context: Context, callback: Callback) => {
  console.log('run the event from something-else', { event, context, callback })
  console.log('SOMETHING_IMPORTANT', process.env.SOMETHING_IMPORTANT)
  return {
    message: 'done',
  }
}
