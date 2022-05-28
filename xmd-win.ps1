param(
    [Parameter(Mandatory=$true)]
    [String]
    $Src,
    [ValidateSet("html_tufte", "tex_tufte", "tex_doc", "html_slides")]
    [String]
    $Template = "tex_doc"
)

if (!Test-Path $Src)
{
    throw "Could not find '$Src', aborting"
}

# Ensure the volume is set, on the host, to the folder containing the source file
$VolPath = Split-Path $Src
$EntryFilePath = Split-Path $Src -Leaf

$SrcInContainer = Join-Path '/home/xmd/out' $EntryFilePath

$PathToPdfLatexInContainer = '/usr/local/texlive/2022/bin/x86_64-linux/pdflatex'
$AppInput = "--src $SrcInContainer --debug --template $Template --pdfLatexPath $PathToPdfLatexInContainer"

# Call the application
docker run --name xmd --rm -it -v "$VOL_PATH:/home/xmd/out" xmd/v1:run $AppInput
