export const enum EFailure {
  None,
  NoDefineThread,
  MultipleDefineThread,
  TranspilationError,
  BundlingError,
  UnableToLocateTranspiledFile,
  UnableToLocateOutputDir,
  UnableToLocateOutputBundledFile,
}

export type TAttempt<TValue> = {
  success: boolean,
  failure?: EFailure,
  value?: TValue
}

const unreachable = (_?: 'error: Did you forget to handle a case?'): never => { throw new Error("Didn't expect to get here") };

export function reportFailure(failure: EFailure, workerFile: string): boolean {
  switch (failure) {
    case EFailure.NoDefineThread:
      console.error("");
      return false;
    case EFailure.MultipleDefineThread:
      console.error("");
      return false;
    case EFailure.TranspilationError:
      console.error("");
      return false;
    case EFailure.BundlingError:
      console.error("");
      return false;
    case EFailure.UnableToLocateTranspiledFile:
      console.error("");
      return false;
    case EFailure.UnableToLocateOutputDir:
      console.error("");
      return false;
    case EFailure.UnableToLocateOutputBundledFile:
      console.error("");
      return false;
    case EFailure.None:
      throw new Error("No failure provided, thus no error can be reported. Likely a bug should be filed.")
    default:
      unreachable(failure);
  }
}