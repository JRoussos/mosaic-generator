import React, { useRef } from 'react'
import './file_upload_styles.css'

const DEFAULT_MAX_FILE_SIZE_IN_BYTES = 500000;

const FileUpload = ({label, handler, ...props}) => {
    const fileInputRef = useRef()

    const addNewFiles = (fileList) => {
        const file = fileList[0]
        let isImageFile = file.type.split("/")[0] === "image";
        if (file.size <= DEFAULT_MAX_FILE_SIZE_IN_BYTES && isImageFile) {
            handler(file)
        }
    }

    const handleOnFileChange = (event) => {
        const { files: newFiles } = event.target
        if (newFiles.length > 0) addNewFiles(newFiles)
    }

    return (
        <input type='file' ref={fileInputRef} onChange={handleOnFileChange} title='' value='' {...props}/>
    )
}

export default FileUpload