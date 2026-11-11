import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import PlayerAvatar from './PlayerAvatar'
import AvatarCropDialog from './AvatarCropDialog'
import { useLocalPlayer } from './LocalPlayerProvider'
import { PLAYER_AVATAR_MAX_FILE_BYTES } from '../lib/localPlayerAvatar'
import './AvatarSettings.css'

export default function AvatarSettings() {
  const {avatarUrl, setAvatar, clearAvatar} = useLocalPlayer()
  const fileInput = useRef<HTMLInputElement>(null)
  const [chosenFile, setChosenFile] = useState<File|null>(null)
  const [feedback, setFeedback] = useState('')
  const changeFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = '' // allow selecting the same file again
    if (!file) return
    if (file.size > PLAYER_AVATAR_MAX_FILE_BYTES) {setFeedback('Choose an image smaller than 10 MB.');return}
    if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) {setFeedback('Use a JPG, PNG, WebP, or GIF image.');return}
    setFeedback('');setChosenFile(file)
  }
  const remove = () => {
    if (clearAvatar()) setFeedback('Default CubeHero avatar restored.')
    else setFeedback('Could not update your browser storage.')
  }
  const save = (value:string) => {
    const saved = setAvatar(value)
    if (saved) setFeedback('Your new avatar is saved on this device.')
    return saved
  }
  return <div className="cube-avatar-settings">
    <div className="cube-avatar-settings-preview"><PlayerAvatar className="cube-avatar-settings-image" decorative/><div><strong>Your profile picture</strong><p>{avatarUrl?'Custom avatar active':'Using the CubeHero default avatar'}</p><small>Square crop · JPG, PNG, WebP, or GIF · Max 10 MB</small></div></div>
    <div className="cube-avatar-settings-actions"><button type="button" className="btn btn-primary btn-sm" onClick={()=>fileInput.current?.click()}><Camera size={16}/>{avatarUrl?'Change picture':'Upload picture'}</button>{avatarUrl&&<button type="button" className="btn btn-outline btn-sm" onClick={remove}><Trash2 size={16}/> Restore default</button>}</div>
    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={changeFile} hidden aria-label="Choose a profile picture"/>
    {feedback&&<p className="cube-avatar-settings-feedback" role="status">{feedback}</p>}
    {chosenFile&&<AvatarCropDialog file={chosenFile} onSave={save} onClose={()=>setChosenFile(null)}/>}
  </div>
}
