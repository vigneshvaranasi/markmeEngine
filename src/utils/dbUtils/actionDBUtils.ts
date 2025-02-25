import Action from '../../models/Action'

export const addAction = async (username: string, action: string) => {
  try {
    const newAction = new Action({
      username: username,
      action: action
    })
    await newAction.save()
  } catch (err) {
    console.error(err)
  }
}
