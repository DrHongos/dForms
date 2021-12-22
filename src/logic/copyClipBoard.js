import toast from "react-hot-toast";
const copy = (str) => {
  const el = document.createElement("textarea")
  el.value = str
  el.setAttribute("readonly", "")
  el.style.position = "absolute"
  el.style.left = "-9999px"
  document.body.appendChild(el)
  el.select()
  document.execCommand("copy")
  document.body.removeChild(el)
  toast.success(`Copied\n${el.value}\n to clipboard`, {
    style: {
      border: '1px solid #713200',
      padding: '16px',
      color: '#713200',
    },
  });
}
export default copy;
