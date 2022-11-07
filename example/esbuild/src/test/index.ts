interface Event {}
interface Context {}
type Callback = (err?: unknown) => void

export const event = async (event: Event, context: Context, callback: Callback) => {
  console.log('run the event from test', { event, context, callback })
  return {
    message: 'done',
  }
}
