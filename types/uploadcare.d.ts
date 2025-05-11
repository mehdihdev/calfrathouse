declare global {
  namespace JSX {
    interface IntrinsicElements {
      'uc-config': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'ctx-name'?: string;
        pubkey?: string;
      };
      'uc-file-uploader-regular': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'ctx-name'?: string;
        onFileSelect?: (event: CustomEvent<{ uuid: string }>) => void;
      };
    }
  }
}

export {}
